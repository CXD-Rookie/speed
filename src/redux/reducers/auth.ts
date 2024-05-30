// reducers/auth.ts

import { LOGIN_SUCCESS, LOGOUT, SET_IS_LOGIN, OPEN_REAL_NAME_MODAL, CLOSE_REAL_NAME_MODAL,OPEN_PAY_MODAL,CLOSE_PAY_MODAL} from '../actions/auth';

const initialState = {
  isAuthenticated: false,
  token: null,
  isLogin:false,
  isRealOpen: false,
  isPayOpen:false,
};

const authReducer = (state = initialState, action:any) => {
  switch (action.type) {
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
    default:
      return state;
  }
};

export default authReducer;
