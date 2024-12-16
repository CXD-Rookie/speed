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

// 查看对象的那个键是空值
function checkMissingValues(params) {
  const missingKeys = [];

  // 遍历 apiHeaderParams 对象的所有键值对
  for (const key in params) {
    if ([null, undefined, ''].includes(params[key])) {
      missingKeys.push(key);
    }
  }

  return missingKeys;
}

// 校验必传参数是否为空 params 参数 isToken 是否需要校验token
export async function validateRequiredParams (params = {}, isToken = true) {
  try {
    const userToken = localStorage.getItem('token');
    const clietToken = localStorage.getItem('client_token');
    const value = isToken ? { ...params, userToken, clietToken } : params
    const missValue = checkMissingValues(value);
    console.log(missValue);
    
    if (missValue?.length > 0) {
      if (missValue.includes("userToken")) {
        window.loginOutStopWidow(); // 退出登录
        return false
      } else if ("clietToken") {
        window.NativeApi_AsynchronousRequest("UpdateClientToken", "", (res) => console.log(res))
        validateRequiredParams(params, isToken);
      } else {
        return false
      }
    } else {
      return true
    }
  } catch (error) {
    return false
  }
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

export const nodeDebounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId); // 清除上一个定时器
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null; // 清除引用，确保下次点击时重新创建定时器
    }, delay);
  };
};

export const formatDate = (timestamp) => {
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
