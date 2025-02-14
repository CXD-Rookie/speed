// src/redux/actions/search.ts
import { Dispatch } from 'redux';
import gameApi from "@/api/gamelist"

export const FETCH_SEARCH_RESULTS = 'FETCH_SEARCH_RESULTS';
export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';
export const SEARCH_LOADING = 'SEARCH_LOADING';

interface SearchResult {
  id: string;
  name: string;
  name_en: string;
}

export const fetchSearchResults = (query: string, tag?: string, page: number = 1, pageSize: number = 5000) => {
  return async (dispatch: Dispatch, getState: any) => {
    dispatch({ type: SET_SEARCH_QUERY, payload: query });
    dispatch({ type: SEARCH_LOADING, payload: true });

    if (!(query?.length > 0)) {
      return
    }

    try {
      const params = {
        s: query,
        page,
        pagesize: pageSize,
      };
      
      let response = await gameApi.gameList(params);
      let results = response.data.list || []; // 如果 data.list 为 null，则使用空数组
      
      results = results.map((item: any) => ({...item, 
        cover_img: `${process.env.REACT_APP_SHEER_API_URL}${item.cover_img ? item.cover_img : item.background_img}`,
      }))

      dispatch({ type: SEARCH_LOADING, payload: false });
      dispatch({
        type: FETCH_SEARCH_RESULTS,
        payload: results as SearchResult[],
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
};
