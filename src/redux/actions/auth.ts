export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_IS_LOGIN = 'SET_IS_LOGIN';
export const OPEN_REAL_NAME_MODAL = 'OPEN_REAL_NAME_MODAL';
export const CLOSE_REAL_NAME_MODAL = 'CLOSE_REAL_NAME_MODAL';
export const OPEN_PAY_MODAL = 'OPEN_PAY_MODAL';
export const CLOSE_PAY_MODAL = 'CLOSE_PAY_MODAL';
export const UPDATE_DELAY = 'UPDATE_DELAY';
export const STOP_ACCELERATE = 'STOP_ACCELERATE';
export const ACCELERATE_TIME = 'ACCELERATE_TIME';

export const AccelerateTime = (accelerateTime: any) => ({
  type: STOP_ACCELERATE,
  payload: accelerateTime,
});

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

export const openPayModal = () => ({
  type: OPEN_PAY_MODAL,
});

export const closePayModal = () => ({
  type: CLOSE_PAY_MODAL,
});

export const updateDelay = (delay: any) => ({
  type: UPDATE_DELAY,
  payload: delay,
});

export const stopAccelerate = (isStop: any) => ({
  type: STOP_ACCELERATE,
  payload: isStop,
});