const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}年${month}月${day}日`;
};

// 获取当天零点时刻的时间戳
function getMidnightTimestamp (timestamp) {
  // 将给定的时间戳转换为 Date 对象
  const date = new Date(timestamp * 1000); // 时间戳单位是秒，需要乘以 1000 转换为毫秒

  // 将 Date 对象调整到当天的零点时刻
  date.setHours(0, 0, 0, 0); // 设置小时、分钟、秒和毫秒为 0

  // 将调整后的 Date 对象转换回时间戳
  const midnightTimestamp = date.getTime() / 1000; // 转换回秒单位的时间戳

  return midnightTimestamp - 1;
}

// 比较是否是同一天
function isSameDay (timestamp1, timestamp2) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  const dateOnly1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const dateOnly2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  return dateOnly1.getTime() === dateOnly2.getTime();
}

const validityPeriod = (record = {}) => {
  const {
    redeem_code = {
      goods_expire_time: 0,
    },
    status,
  } = record;
  const timestamp = Number(localStorage.getItem("timestamp"));
  const difference = redeem_code?.goods_expire_time - timestamp;
  const isSame = isSameDay(redeem_code?.goods_expire_time, timestamp) // 是否是同一天
  let days = 0;

  // 是否是同一天并且过期时间大于当前时间
  if (isSame && difference > 0) {
    days = 1;
  } else if (!isSame && difference > 0) {
    const nightTime = getMidnightTimestamp(timestamp); // 当天零点时刻的时间戳
    days = days + Math.ceil((redeem_code?.goods_expire_time - nightTime) / 86400);
  }
  
  if ((days > 5 && days <= 10950) || [2, 3].includes(status)) {
    return "有效期至 " + formatDate(redeem_code?.goods_expire_time);
  } else if (days > 10950) {
    return "无期限";
  } else if (days > 1 && days <= 5) {
    return days + "天后到期";
  } else if (difference > 0 && days <= 1 && days >= 0) {
    return "今天到期"
  } else {
    return "--"
  }
}

export {
  validityPeriod,
  formatDate
}