/*
 * @Author: zhangda
 * @Date: 2024-05-28 20:53:18
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-24 20:04:54
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\redux\reducers\auth.ts
 */
// reducers/auth.ts

import { 
  LOGIN_SUCCESS, 
  LOGOUT, 
  SET_IS_LOGIN, 
  OPEN_REAL_NAME_MODAL, 
  CLOSE_REAL_NAME_MODAL,
  OPEN_PAY_MODAL,
  CLOSE_PAY_MODAL, 
  UPDATE_DELAY,
  STOP_ACCELERATE,
  ACCELERATE_TIME,
  BIND_PHONE,
  SIGN_EXPIRES,
} from '../actions/auth';

const initialState = {
  isAuthenticated: false,
  token: null,
  isLogin:false,
  isRealOpen: false,
  isPayOpen:false,
  delay: 0,
  isStop: true,
  accelerateTime: 0,
  isBindPhone: false,
  sign_expires: false,
};

const authReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case SIGN_EXPIRES:
      return {
        ...state,
        sign_expires: action.payload,
      };
    case BIND_PHONE:
      return {
        ...state,
        isBindPhone: action.payload,
      };
    case ACCELERATE_TIME:
      return {
        ...state,
        accelerateTime: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
      };
    case SET_IS_LOGIN:
        return {
          ...state,
          isLogin: action.payload,
    };
    case OPEN_REAL_NAME_MODAL:
      return {
        ...state,
        isRealOpen: true,
      };
    case CLOSE_REAL_NAME_MODAL:
      return {
        ...state,
        isRealOpen: false,
      };
    case OPEN_PAY_MODAL:
      return {
        ...state,
        isPayOpen: true,
      };
    case CLOSE_PAY_MODAL:
      return {
        ...state,
        isPayOpen: false,
      };
    case UPDATE_DELAY:
      return {
        ...state,
        delay: action.payload,
      };
    case STOP_ACCELERATE:
      return {
        ...state,
        isStop: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
