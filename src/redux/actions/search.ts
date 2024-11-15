// src/redux/actions/search.ts
import { Dispatch } from 'redux';
import searchApi from "@/api/search";

export const FETCH_SEARCH_RESULTS = 'FETCH_SEARCH_RESULTS';
export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';

interface SearchResult {
  id: string;
  name: string;
  name_en: string;
}

export const fetchSearchResults = (query: string, tag?: string, page: number = 1, pageSize: number = 5000) => {
  return async (dispatch: Dispatch, getState: any) => {
    dispatch({ type: SET_SEARCH_QUERY, payload: query });
    
    if (!(query?.length > 0)) {
      return
    }

    try {
      const params = {
        s: query,
        t: tag || '',
        page,
        pagesize: pageSize,
      };
      // const state = getState();
      // const results_state = state.search.results;

      // console.log('Fetching search results with params:', params);
      
      let response = await searchApi.search(params);
      let results = response.data.list || []; // 如果 data.list 为 null，则使用空数组
      
      results = results.map((item: any) => ({...item, 
        cover_img: `https://cdn.accessorx.com/${item.cover_img ? item.cover_img : item.background_img}`,
      }))

      dispatch({
        type: FETCH_SEARCH_RESULTS,
        payload: results as SearchResult[],
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
};
