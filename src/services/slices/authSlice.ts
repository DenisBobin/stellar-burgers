import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { TUser } from '../../utils/types';

import { loginUserApi, registerUserApi, logoutApi, getUserApi, updateUserApi } from '../../utils/burger-api';
import type { TLoginData, TRegisterData } from '../../utils/burger-api';
import { setCookie, deleteCookie } from '../../utils/cookie';

type TAuthState = {
  user: TUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthChecked: boolean;
};

const initialState: TAuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthChecked: false
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (loginData: TLoginData) => {
    const response = await loginUserApi(loginData);

    localStorage.setItem('refreshToken', response.refreshToken);
    setCookie('accessToken', response.accessToken);

    return response.user;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await logoutApi();

    localStorage.removeItem('refreshToken');
    deleteCookie('accessToken');
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (registerData: TRegisterData) => {
    const response = await registerUserApi(registerData);

    localStorage.setItem('refreshToken', response.refreshToken);
    setCookie('accessToken', response.accessToken);

    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData: Partial<TRegisterData>) => {
    const response = await updateUserApi(userData);
    return response.user;
  }
);

export const checkUserAuth = createAsyncThunk(
  'auth/checkUserAuth',
  async () => {
    if (!localStorage.getItem('refreshToken')) {
      return null;
    }

    const response = await getUserApi();
    return response.user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка авторизации';
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка регистрации';
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка выхода';
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка обновления профиля';
      })
        }
});

export default authSlice.reducer;