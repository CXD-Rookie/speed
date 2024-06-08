// src/redux/actions/search-enter.ts
import { Dispatch } from 'redux';

export const IS_SHOW_LOGIN = 'IS_SHOW_LOGIN';
export const IS_LOGIN = 'IS_LOGIN';
export const USER_INFO = 'USER_INFO';

export const setAccountInfo = (userInfo?: Object, isLogin?: boolean, isShowLogin?: boolean) => {
  return (dispatch: Dispatch) => {
    if (isShowLogin !== undefined) {
      dispatch({ type: IS_SHOW_LOGIN, payload: isShowLogin });
    }
    if (isLogin !== undefined) {
      dispatch({ type: IS_LOGIN, payload: isLogin });
    }
    if (userInfo !== undefined) {
      dispatch({ type: USER_INFO, payload: userInfo });
    }
  };
};
