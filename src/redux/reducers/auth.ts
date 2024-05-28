// reducers/auth.ts

import { LOGIN_SUCCESS, LOGOUT, SET_IS_LOGIN} from '../actions/auth';

const initialState = {
  isAuthenticated: false,
  token: null,
  isLogin:false,
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
    default:
      return state;
  }
};

export default authReducer;
