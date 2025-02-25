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
  url = process.env.REACT_APP_API_URL + "api/v1";

  // 加速心跳 用于加速key保活
  speedHeartbeat (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/game/speed/heartbeat?${queryString}`);
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
    return get(`${this.url}/game/speed/list`, params);
  }

  playSpeedStart (params) {
    return get(`${this.url}/game/speed/start`, params);
  }

  playSpeedEnd (params) {
    return get(`${this.url}/game/speed/end`, params);
  }

  playSpeedBlackWhitelist (params) {
    return get(`${this.url}/black_white_list`, params);
  }

  // 进程黑名单
  playProcessblacklist (params) {
    return get(`${this.url}/game/process/blacklist`, {
      platform: 3,
      ...params,
    });
  }
}

const playSuitApi = new PlaySuit();

export default playSuitApi;