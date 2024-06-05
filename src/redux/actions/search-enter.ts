// src/redux/actions/search-enter.ts
import { Dispatch } from 'redux';

export const ENTER_SEARCH_QUERY = 'ENTER_SEARCH_QUERY';

export const setEnterSign = (sign: number) => {
  return async (dispatch: Dispatch) => {
    try {
      let results = sign + 1

      dispatch({
        type: ENTER_SEARCH_QUERY,
        payload: results as number,
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
};
