const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}年${month}月${day}日`;
};

const validityPeriod = (record = {}) => {
  const {
    redeem_code = {
      goods_expire_time: 0,
    },
    status,
  } = record;
  const timestamp = Number(localStorage.getItem("timestamp"));
  const difference = redeem_code?.goods_expire_time - timestamp;
  const days = Math.floor(difference / 86400);

  if (days >= 5 || [2, 3].includes(status)) {
    return "有效期至 " + formatDate(redeem_code?.goods_expire_time);
  } else if (days >= 10950) {
    return "无期限";
  } else if (days >= 2 && days < 5) {
    return days + "天后到期";
  } else if (days <= 1 && days > 0) {
    return "今天到期"
  } else {
    return "--"
  }
}

export {
  validityPeriod,
  formatDate
}