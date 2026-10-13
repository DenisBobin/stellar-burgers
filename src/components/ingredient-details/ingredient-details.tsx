import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '../../services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();

  const ingredients = useSelector(
    (state) => state.ingredients.ingredients
  );

  const isLoading = useSelector(
    (state) => state.ingredients.isLoading
  );

  const error = useSelector(
    (state) => state.ingredients.error
  );

  const ingredientData = ingredients.find(
    (ingredient) => ingredient._id === id
  );

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return <p>Ошибка загрузки ингредиентов: {error}</p>;
  }

  if (!ingredientData) {
    return <p>Ингредиент не найден</p>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};