import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR('tests/hars/api.har', {
    url: '**/api/**',
    update: false,
    notFound: 'abort',
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Тестовая булочка')).toBeVisible({ timeout: 15000 });
});

test.describe('Конструктор бургера', () => {
  test('Загрузка моковых ингредиентов', async ({ page }) => {
    await expect(page.getByText('Тестовая булочка')).toBeVisible();
    await expect(page.getByText('Тестовая котлета')).toBeVisible();
  });

  test('Добавление булочки и начинки в конструктор', async ({ page }) => {
    const constructorSection = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });

    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(2);

    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();

    const bunCard = page.locator('li').filter({ hasText: 'Тестовая булочка' });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const mainCard = page.locator('li').filter({ hasText: 'Тестовая котлета' });

    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(constructorSection.getByText('Тестовая булочка (верх)')).toBeVisible();

    await expect(constructorSection.getByText('Тестовая булочка (низ)')).toBeVisible();

    await expect(constructorSection.getByText('Тестовая котлета')).toBeVisible();

    await expect(constructorSection.getByText('Выберите начинку')).toHaveCount(0);
  });
});

test.describe('Модальное окно ингредиента', () => {
  test('Открытие и закрытие модального окна ингредиента', async ({ page }) => {
    // 1. Находим модальное окно
    const modal = page.getByTestId('modal');
    await expect(modal).toHaveCount(0);

    // 2. Нажимаем на ингредиент
    await page.getByText('Тестовая булочка').click();

    // 3. Проверяем изменение адреса
    await expect(page).toHaveURL(/\/ingredients\/test-bun-1$/);

    // 4. Проверяем, что окно открылось
    await expect(modal).toBeVisible();

    // 5. Внутри окна отображается выбранный ингредиент
    await expect(modal.getByText('Тестовая булочка')).toBeVisible();

    // 6. Находим кнопку закрытия внутри модального окна
    const closeButton = modal.getByRole('button', { name: 'Закрыть' });

    // 7. Нажимаем на крестик
    await closeButton.click();

    // 8. Проверяем, что модальное окно исчезло
    await expect(modal).toHaveCount(0);

    // 9. Проверяем возврат на главную страницу
    await expect(page).toHaveURL('http://localhost:4000/');
  });

  test('Закрытие модального окна по оверлею', async ({ page }) => {
    // Открываем модальное окно
    await page.getByText('Тестовая булочка').click();

    // Проверяем, что окно открылось
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();

    // Находим оверлей и нажимаем на него
    const overlay = page.getByTestId('modal-overlay');

    await overlay.click({ position: { x: 10, y: 10 } });

    // Проверяем, что окно закрылось
    await expect(modal).toHaveCount(0);

    // Проверяем возврат на главную страницу
    await expect(page).toHaveURL('http://localhost:4000/');
  });
});
