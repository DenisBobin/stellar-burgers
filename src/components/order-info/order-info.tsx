import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '../../services/store';
import { fetchOrderByNumber } from '../../services/slices/orderDetailsSlice';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams();
  const dispatch = useDispatch();

  const orderData = useSelector(
    (state) => state.orderDetails.orderData
  );

  const isLoading = useSelector(
    (state) => state.orderDetails.isLoading
  );

  const error = useSelector(
    (state) => state.orderDetails.error
  );

  const ingredients = useSelector(
    (state) => state.ingredients.ingredients
  );

  useEffect(() => {
    const orderNumber = Number(number);

    if (number && Number.isInteger(orderNumber) && orderNumber > 0) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [number, dispatch]);

  // Далее оставляем существующий useMemo

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

    if (!number || !Number.isInteger(Number(number)) || Number(number) <= 0) {
    return <p>Некорректный номер заказа</p>;
  }

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return <p>Ошибка загрузки заказа: {error}</p>;
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
