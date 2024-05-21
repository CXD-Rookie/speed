/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-13 14:37:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-21 22:28:21
 * @FilePath: \speed\src\api\login.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get, post } from "./api";

class GameList {
  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`
  // url = `/api/v1`

  gameList (parmas) {
    return get(
      `${this.url}/game/list`
    );
  }
}

const gameList = new GameList();

export default gameList;