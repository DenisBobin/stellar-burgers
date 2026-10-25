import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';

import type { TConstructorIngredient } from '@utils-types';
import { useSelector, useDispatch, } from '../../services/store';

import { useNavigate } from 'react-router-dom';

import { createOrder, clearOrder } from '../../services/slices/orderSlice';
import { clearConstructor } from '../../services/slices/constructorSlice';

export const BurgerConstructor = (): React.JSX.Element | null => {

const dispatch = useDispatch();
const navigate = useNavigate();
const user = useSelector((state) => state.auth.user);

  const constructorItems = useSelector(
    (state) => state.burgerConstructor
  );
  const orderRequest = useSelector((state) => state.order.orderRequest);
  const orderModalData = useSelector((state) => state.order.orderModalData);
  const orderError = useSelector((state) => state.order.error);

  const onOrderClick = (): void => {
  if (!constructorItems.bun || orderRequest) return;

  if (!user) {
    navigate('/login');
    return;
  }

  const ingredientIds = [
    constructorItems.bun._id,
    ...constructorItems.ingredients.map((ingredient) => ingredient._id),
    constructorItems.bun._id
  ];

  dispatch(createOrder(ingredientIds))
    .unwrap()
    .then(() => {
      dispatch(clearConstructor());
    })
    .catch(() => {
      // Ошибка уже сохранена в orderSlice
    });
  };


  const closeOrderModal = (): void => {
    dispatch(clearOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
      orderError={orderError}
    />
  );
};
