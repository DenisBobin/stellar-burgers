import constructorReducer, {
  clearConstructor,
  addIngredient,
  removeIngredient,
  moveIngredient,
} from './constructorSlice';

// Общие тестовые данные
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
  image_large: '',
};

const firstIngredient = {
  ...testIngredient,
  id: 'ingredient-1',
  name: 'Котлета',
};

const secondIngredient = {
  ...testIngredient,
  id: 'ingredient-2',
  name: 'Сыр',
};

const thirdIngredient = {
  ...testIngredient,
  id: 'ingredient-3',
  name: 'Соус',
};

const testBun = {
  ...testIngredient,
  _id: 'bun-123',
  id: 'bun-1',
  name: 'Тестовая булочка',
  type: 'bun',
};

describe('Начальное состояние конструктора', () => {
  test('Возвращает начальное состояние при неизвестном действии', () => {
    const result = constructorReducer(undefined, {
      type: 'UNKNOWN_ACTION',
    });

    expect(result).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});

describe('Очистка конструктора', () => {
  test('Удаляет булку и все ингредиенты из конструктора', () => {
    const filledState = {
      bun: testBun,
      ingredients: [firstIngredient],
    };

    const result = constructorReducer(filledState, clearConstructor());

    expect(result).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});

describe('Добавление ингредиентов', () => {
  test('Добавляет начинку в массив ingredients и не изменяет bun', () => {
    const initialState = {
      bun: null,
      ingredients: [],
    };

    const result = constructorReducer(initialState, addIngredient(testIngredient));

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toEqual({
      ...testIngredient,
      id: expect.any(String),
    });
    expect(result.bun).toBeNull();
  });

  test('Добавляет булку в поле bun без добавления в ingredients', () => {
    const initialState = {
      bun: null,
      ingredients: [],
    };

    const bun = {
      ...testIngredient,
      type: 'bun',
    };

    const result = constructorReducer(initialState, addIngredient(bun));

    expect(result.bun).toEqual({
      ...bun,
      id: expect.any(String),
    });
    expect(result.ingredients).toHaveLength(0);
  });
});

describe('Удаление ингредиентов', () => {
  test('Удаляет выбранный средний ингредиент по id и сохраняет остальные', () => {
    const initialState = {
      bun: null,
      ingredients: [firstIngredient, secondIngredient, thirdIngredient],
    };

    const result = constructorReducer(initialState, removeIngredient('ingredient-2'));

    expect(result.ingredients).toEqual([firstIngredient, thirdIngredient]);
  });
});

describe('Перемещение ингредиентов', () => {
  test('Меняет местами ингредиенты при корректных индексах', () => {
    const initialState = {
      bun: null,
      ingredients: [firstIngredient, secondIngredient],
    };

    const result = constructorReducer(initialState, moveIngredient({ from: 0, to: 1 }));

    expect(result.ingredients).toEqual([secondIngredient, firstIngredient]);
  });

  test('Сохраняет состояние при перемещении за пределы массива', () => {
    const initialState = {
      bun: null,
      ingredients: [firstIngredient, secondIngredient],
    };

    const result = constructorReducer(initialState, moveIngredient({ from: 0, to: 5 }));

    expect(result).toEqual(initialState);
  });
});
