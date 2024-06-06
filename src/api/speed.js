import { get } from "./api";

class PlaySuit {

  url = `https://test-api.accessorx.com/api/v1`;

  speedInfo (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed_info?${queryString}`);
  }

  pcPlatform (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/pc_platform/list?${queryString}`);
  }

  playSuit (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/playsuit/list_1716444721785?${queryString}`);
  }

  playSuitList (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/playsuit/list?${queryString}`);
  }

  playSpeedList (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed/list`, params);
  }
}

const playSuitApi = new PlaySuit();

export default playSuitApi;