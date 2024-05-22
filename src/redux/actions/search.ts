// src/redux/actions/search.ts
import axios from 'axios';
import { Dispatch } from 'redux';
import searchApi from "@/api/search";

export const FETCH_SEARCH_RESULTS = 'FETCH_SEARCH_RESULTS';
export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';

interface SearchResult {
  id: string;
  name: string;
  name_en: string;
}

export const fetchSearchResults = (query: string, tag?: string, page: number = 1, pageSize: number = 10) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: SET_SEARCH_QUERY, payload: query });

    try {
      const params = {
        s: query,
        t: tag || '',
        page,
        pagesize: pageSize,
      };

      console.log('Fetching search results with params:', params);

      let response = await searchApi.search(params);
      const results = response.data.list || []; // 如果 data.list 为 null，则使用空数组

      dispatch({
        type: FETCH_SEARCH_RESULTS,
        payload: results as SearchResult[],
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
};
