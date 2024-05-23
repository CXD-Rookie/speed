import { get } from "./api";

class PlaySuit {
  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`;

  playSuit(params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/playsuit/list_1716444721785?${queryString}`);
  }

  playSuitList(params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/playsuit/list?${queryString}`);
  }
}

const playSuitApi = new PlaySuit();

export default playSuitApi;