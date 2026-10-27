import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

test('[ingredientsSlice] pending', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null
  };

  const result = ingredientsReducer(
    initialState,
    fetchIngredients.pending('', undefined)
  );

  expect(result).toEqual({
    ingredients: [],
    isLoading: true,
    error: null
  });
});

test('[ingredientsSlice] fulfilled', () => {
  const initialState = {
    ingredients: [],
    isLoading: true,
    error: null
  };

  const testIngredient = {
    _id: '123',
    name: 'Тестовая булочка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 100,
    price: 200,
    image: '',
    image_mobile: '',
    image_large: ''
  };

  const result = ingredientsReducer(
    initialState,
    fetchIngredients.fulfilled(
      [testIngredient],
      '',
      undefined
    )
  );

  expect(result).toEqual({
    ingredients: [testIngredient],
    isLoading: false,
    error: null
  });
});

test('[ingredientsSlice] reject', ()=>{
  const initialState = {
    ingredients: [],
    isLoading: true,
    error: null
  };

  const result = ingredientsReducer(
    initialState,
    fetchIngredients.rejected(
      new Error('Ошибка сервера'),
      '',
      undefined
    )
  );

  expect(result).toEqual({
    ingredients: [],
    isLoading: false,
    error: 'Ошибка сервера'
  })
});

test('[ingredientsSlice] неизвестный экшен', () => {
  const result = ingredientsReducer(
    undefined,
    { type: 'UNKNOWN' }
  );

  expect(result).toEqual({
    ingredients: [],
    isLoading: false,
    error: null
  });
});