// src/redux/reducers/search-enter.ts

import { ENTER_SEARCH_QUERY } from '../actions/search-enter';

const initialState: Number = 0;

const searchEnterReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ENTER_SEARCH_QUERY:
      return action.payload;
    default:
      return state;
  }
};

export default searchEnterReducer;
