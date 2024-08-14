// src/api/search.ts
import { get } from "./api";

class Search {
  url = process.env.REACT_APP_API_URL;

  search (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/list?${queryString}`);
  }
}

const searchApi = new Search();

export default searchApi;