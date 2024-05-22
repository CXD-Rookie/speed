/*
 * @Author: zhangda
 * @Date: 2024-05-22 15:06:42
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-22 15:08:37
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\common\utils.js
 */
// 获取我的游戏列表
export const getMyGames = () => {
  let local_games = localStorage.getItem("speed-1.0.0.1-games");
  let result = local_games ? JSON.parse(local_games) : [];

  return result;
}