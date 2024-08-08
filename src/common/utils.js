/*
 * @Author: zhangda
 * @Date: 2024-05-22 15:06:42
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-08 16:04:08
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

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getRemainingDays = (timestamp) => {
  const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）

  // 计算剩余时间（秒）
  const remainingTime = timestamp - currentTime;

  // 将剩余时间转换为天数，并向上取整
  return Math.ceil(remainingTime / (60 * 60 * 24));
};

export const convertSecondsToDays = (seconds) => {
  // 将秒数转换为天数，并向上取整
  return Math.ceil(seconds / (60 * 60 * 24));
};
