export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_IS_LOGIN = 'SET_IS_LOGIN';
export const OPEN_REAL_NAME_MODAL = 'OPEN_REAL_NAME_MODAL';
export const CLOSE_REAL_NAME_MODAL = 'CLOSE_REAL_NAME_MODAL';
export const loginSuccess = (token: string) => ({
  type: LOGIN_SUCCESS,
  payload: token,
});

export const logout = () => ({
  type: LOGOUT,
});

export const setIsLogin = (isLogin:any) => ({
    type: 'SET_IS_LOGIN',
    payload: isLogin,
});

export const openRealNameModal = () => ({
  type: OPEN_REAL_NAME_MODAL,
});

export const closeRealNameModal = () => ({
  type: CLOSE_REAL_NAME_MODAL,
});

