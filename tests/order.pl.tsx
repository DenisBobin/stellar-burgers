import { test, expect } from '@playwright/test';

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    // Подменяем ответы API через HAR
    await page.routeFromHAR('tests/hars/api.har', {
      url: '**/api/**',
      update: false,
      notFound: 'abort',
    });

    // Устанавливаем тестовый accessToken
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        url: 'http://localhost:4000',
      },
    ]);

    // Устанавливаем refreshToken до загрузки приложения
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    // Открываем приложение
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Проверяем загрузку ингредиентов
    await expect(page.getByText('Тестовая булочка')).toBeVisible({ timeout: 15000 });
  });

  test('Оформление заказа', async ({ page }) => {
    // 1. Добавляем булочку
    const bunCard = page.locator('li').filter({ hasText: 'Тестовая булочка' });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    // 2. Добавляем котлету
    const mainCard = page.locator('li').filter({ hasText: 'Тестовая котлета' });

    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // 3. Находим конструктор
    const constructorSection = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });

    // Проверяем добавление булочки
    await expect(constructorSection.getByText('Тестовая булочка (верх)')).toBeVisible();

    // Проверяем отсутствие модального окна
    const modal = page.getByTestId('modal');
    await expect(modal).toHaveCount(0);

    // 4. Оформляем заказ
    const orderRequestPromise = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    // Проверяем отправку запроса
    const orderRequest = await orderRequestPromise;

    expect(orderRequest.postDataJSON()).toEqual({
      ingredients: ['test-bun-1', 'test-main-1', 'test-bun-1'],
    });

    // 5. Проверяем модальное окно с номером заказа
    await expect(modal).toBeVisible();
    await expect(modal.getByText('12345')).toBeVisible();

    // 6. Проверяем очистку конструктора
    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(2);

    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();

    // 7. Закрываем модальное окно
    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toHaveCount(0);
  });
});
