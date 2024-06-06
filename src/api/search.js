// src/api/search.ts
import { get } from "./api";

class Search {
  url = `https://test-api.accessorx.com/api/v1`;

  search (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/list?${queryString}`);
  }
}

const searchApi = new Search();

export default searchApi;