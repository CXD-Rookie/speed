import { ACTIVE_MENU } from "../actions/menu";

const initialState = {
  active_menu: "/home",
};

const menuReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case ACTIVE_MENU:
      return {
        ...state,
        active_menu: action.payload,
      };
      default:
    return state;
  }
}

export default menuReducer;