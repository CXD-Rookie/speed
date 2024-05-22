// src/redux/reducers/search.ts

import { FETCH_SEARCH_RESULTS, SET_SEARCH_QUERY } from '../actions/search';

interface SearchState {
  query: string;
  results: { id: string; name: string; name_en: string }[];
}

const initialState: SearchState = {
  query: '',
  results: [],
};

const searchReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_SEARCH_QUERY:
      return {
        ...state,
        query: action.payload,
      };
    case FETCH_SEARCH_RESULTS:
      return {
        ...state,
        results: action.payload,
      };
    default:
      return state;
  }
};

export default searchReducer;
