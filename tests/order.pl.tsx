import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  // Подменяем ответ API с ингредиентами
  await page.routeFromHAR('tests/ingredients.har', {
    url: '**/api/ingredients',
    update: false,
    notFound: 'abort'
  });

  // Устанавливаем тестовый accessToken
  await context.addCookies([
    {
      name: 'accessToken',
      value: 'Bearer test-access-token',
      url: 'http://localhost:4000'
    }
  ]);

  // Устанавливаем refreshToken до загрузки приложения
  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'test-refresh-token');
  });

  // Подменяем ответ API с данными пользователя
  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          email: 'test@example.com',
          name: 'Тестовый пользователь'
        }
      })
    });
  });

  // Подменяем ответ API создания заказа
  await page.route('**/api/orders', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        name: 'Тестовый бургер',
        order: {
          number: 12345
        }
      })
    });
  });

  // Открываем приложение
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Проверяем загрузку ингредиентов
  await expect(
    page.getByText('Тестовая булочка')
  ).toBeVisible({ timeout: 15000 });
});

test('Оформление заказа', async ({ page }) => {
  // 1. Добавляем булочку
  const bunCard = page
    .locator('li')
    .filter({ hasText: 'Тестовая булочка' });

  await bunCard.getByRole('button', { name: 'Добавить' }).click();

  // 2. Добавляем котлету
  const mainCard = page
    .locator('li')
    .filter({ hasText: 'Тестовая котлета' });

  await mainCard.getByRole('button', { name: 'Добавить' }).click();

  // 3. Находим конструктор
  const constructorSection = page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' })
  });

  // Проверяем добавление булочки
  await expect(
    constructorSection.getByText('Тестовая булочка (верх)')
  ).toBeVisible();

  // 4. Оформляем заказ
  const orderRequestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/orders') &&
      request.method() === 'POST'
  );

  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  // Проверяем отправку запроса
  const orderRequest = await orderRequestPromise;

  expect(orderRequest.postDataJSON()).toEqual({
    ingredients: ['test-bun-1', 'test-main-1', 'test-bun-1']
  });

  // 5. Проверяем модальное окно с номером заказа
  const modal = page.getByTestId('modal');

  await expect(modal).toBeVisible();
  await expect(modal.getByText('12345')).toBeVisible();

  // 6. Проверяем очистку конструктора
  await expect(
    constructorSection.getByText('Выберите булки')
  ).toHaveCount(2);

  await expect(
    constructorSection.getByText('Выберите начинку')
  ).toBeVisible();

  // 7. Закрываем модальное окно
  await modal.getByRole('button', { name: 'Закрыть' }).click();

  await expect(modal).toHaveCount(0);
});