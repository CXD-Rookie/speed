// reducers/firstAuth.ts
import { SET_FIRSTAUTH } from '../actions/firstAuth';

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
    default:
      return state;
  }
};

export default firstAuthReducer;
