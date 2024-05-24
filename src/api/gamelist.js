/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-13 14:37:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-24 11:25:37
 * @FilePath: \speed\src\api\gamelist.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get, post } from "./api";

class GameList {
  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`
  // url = `${process.env.REACT_APP_API_URL}/api/v1`

  gameList (parmas) {
    const queryString = new URLSearchParams(parmas).toString();
    return get(`${this.url}/game/list?${queryString}`);
  }
}

const gameList = new GameList();

export default gameList;