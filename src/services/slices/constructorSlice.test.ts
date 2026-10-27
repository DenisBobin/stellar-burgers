import constructorReducer, { clearConstructor, addIngredient, removeIngredient, moveIngredient } from './constructorSlice';

test('[constructorReducer] Неизвестное действие', () => {
  const result = constructorReducer(
    undefined,
    { type: 'UNKNOWN_ACTION' }
  );

  expect(result).toEqual({
    bun: null,
    ingredients: []
  });
});

test('[clearConstructor] Очистка конструктора', () => {
  // Создаём состояние с одним ингредиентом
  const filledState = {
    bun: null,
    ingredients: [
      {
        _id: '123',
        id: 'test-1',
        name: 'Тестовый ингредиент',
        type: 'main',
        proteins: 10,
        fat: 5,
        carbohydrates: 20,
        calories: 100,
        price: 200,
        image: '',
        image_mobile: '',
        image_large: ''
      }
    ]
  };

  // Передаём состояние и действие очистки
  const result = constructorReducer(
    filledState,
    clearConstructor()
  );

  // Проверяем, что ингредиенты удалены
  expect(result).toEqual({
    bun: null,
    ingredients: []
  });
});

const testIngredient = {
  _id: '123',
  name: 'Тестовый ингредиент',
  type: 'main',
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 100,
  price: 200,
  image: '',
  image_mobile: '',
  image_large: ''
};

const firstIngredient = {
  ...testIngredient,
  id: 'ingredient-1',
  name: 'Котлета'
};

const secondIngredient = {
  ...testIngredient,
  id: 'ingredient-2',
  name: 'Сыр'
};

// Тест 3. Добавление начинки
test('[addIngredient] Добавление ингредиента в конструктор', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const result = constructorReducer(
    initialState,
    addIngredient(testIngredient)
  );

  expect(result.ingredients).toHaveLength(1);
  expect(result.ingredients[0]).toEqual({
    ...testIngredient,
    id: expect.any(String)
  });
  expect(result.bun).toBeNull();
});

// Тест 4. Добавление булочки
test('[addIngredient] Добавление булочки в конструктор', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const bun = {
    ...testIngredient,
    type: 'bun'
  };

  const result = constructorReducer(
    initialState,
    addIngredient(bun)
  );

  expect(result.bun).toEqual({
    ...bun,
    id: expect.any(String)
  });
  expect(result.ingredients).toHaveLength(0);
});

test('[removeIngredient] Удаление ингредиента', () => {
  const initialState = {
    bun: null,
    ingredients: [firstIngredient, secondIngredient]
  };

  const result = constructorReducer(
    initialState,
    removeIngredient('ingredient-1')
  );

  expect(result.ingredients).toEqual([secondIngredient]);
});

test('[moveIngredient] Перемещение ингредиента', () => {
  const initialState = {
    bun: null,
    ingredients: [firstIngredient, secondIngredient]
  };

  const result = constructorReducer(
    initialState,
    moveIngredient({ from: 0, to: 1 })
  );

  expect(result.ingredients).toEqual([
    secondIngredient,
    firstIngredient
  ]);
});

test('[moveIngredient] Некорректные индексы', () => {
  const initialState = {
    bun: null,
    ingredients: [firstIngredient, secondIngredient]
  };

  const result = constructorReducer(
    initialState,
    moveIngredient({ from: 0, to: 5 })
  );

  expect(result).toEqual(initialState);
});
