import { START_PATH, CURRENCY_EXCHANGE } from "../actions/modal-open";

const initialState = {
  currencyOpen: false,
  startPathOpen: false,
};

const modalOpenReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case CURRENCY_EXCHANGE:
      return {
        ...state,
        currencyOpen: action.payload,
      };
    case START_PATH:
      return {
        ...state,
        startPathOpen: action.payload,
      };
    default:
      return state;
  }
}

export default modalOpenReducer;