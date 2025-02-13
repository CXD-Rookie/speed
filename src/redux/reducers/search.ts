// src/redux/reducers/search.ts

import {
  FETCH_SEARCH_RESULTS, SET_SEARCH_QUERY,
  SEARCH_LOADING
 } from '../actions/search';

interface SearchState {
  query: string;
  results: { id: string; name: string; name_en: string }[];
  isSearchLoading: boolean;
}

const initialState: SearchState = {
  query: '',
  results: [],
  isSearchLoading: false
};

const searchReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SEARCH_LOADING:
      return {
        ...state,
        isSearchLoading: action.payload,
      }
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
