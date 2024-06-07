/*
 * @Author: zhangda
 * @Date: 2024-05-22 15:06:42
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-07 15:08:47
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

// 是否未成年
export function validateAge (id) {
  const idCard = id;

  // 提取出生日期
  const birthDateStr = idCard.substring(6, 14);
  const birthYear = parseInt(birthDateStr.substring(0, 4), 10);
  const birthMonth = parseInt(birthDateStr.substring(4, 6), 10) - 1; // 月份从0开始
  const birthDay = parseInt(birthDateStr.substring(6, 8), 10);

  const birthDate = new Date(birthYear, birthMonth, birthDay);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  // 如果生日还没到，今年还未满年龄
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  if (age < 18) {
    return false;
  } else {
    return true;
  }
}