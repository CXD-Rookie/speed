/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 14:30:09
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-26 11:16:45
 * @FilePath: \speed\src\api\speed.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get } from "./api";

class PlaySuit {

  url = process.env.REACT_APP_API_URL;

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

  playSuitInfo (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/playsuit/info?${queryString}`);
  }

  playSpeedList (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed/list`, params);
  }

  playSpeedStart (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed/start`, params);
  }

  playSpeedEnd (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed/end`, params);
  }

  playSpeedBlackWhitelist (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/black_white_list`, params);
  }

  
}

const playSuitApi = new PlaySuit();

export default playSuitApi;