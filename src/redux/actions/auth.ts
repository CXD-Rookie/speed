export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_IS_LOGIN = 'SET_IS_LOGIN';
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