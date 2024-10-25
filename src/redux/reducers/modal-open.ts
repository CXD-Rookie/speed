import { START_PATH } from "../actions/modal-open";

const initialState = {
  startPathOpen: false,
};

const modalOpenReducer = (state = initialState, action:any) => {
  switch (action.type) {
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