// reducers/firstAuth.ts
import { SET_FIRSTAUTH,SET_IMAGES } from '../actions/firstAuth';

const initialState = {
  firstAuth: {},
};

const firstAuthReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_FIRSTAUTH:
      return {
        ...state,
        firstAuth: action.payload,
      };
    case SET_IMAGES:
      return {
        ...state,
        images: action.payload,
      };
    default:
      return state;
  }
};

export default firstAuthReducer;
