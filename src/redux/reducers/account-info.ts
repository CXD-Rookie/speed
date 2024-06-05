// src/redux/reducers/search-enter.ts

import { IS_SHOW_LOGIN, IS_LOGIN, USER_INFO } from '../actions/account-info';

interface InfoState {
  userInfo: object;
  isLogin: boolean;
  isShowLogin: boolean;
}

const initialState: InfoState = {
  userInfo: {},
  isLogin: false,
  isShowLogin: true,
};

const accountInfoReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case IS_LOGIN:
      return {
        ...state,
        isLogin: action.payload,
      };
    case IS_SHOW_LOGIN:
      return {
        ...state,
        isShowLogin: action.payload,
      };
    case USER_INFO:
      return {
        ...state,
        userInfo: action.payload,
      };
    default:
      return state;
  }
};

export default accountInfoReducer;
