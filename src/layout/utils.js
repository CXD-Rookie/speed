import eventBus from "@/api/eventBus";
import tracking from "@/common/tracking";

// 生成当天00点时间戳
const getCouponTimeLock = () => {
  // 获取当前日期时间
  let now = new Date();

  // 计算明天的日期
  now.setDate(now.getDate() + 1);
  // 设置时间为00:00:00
  now.setHours(0, 0, 0, 0);

  // 获取该时间的时间戳，并转换为秒级时间戳
  return Math.floor(now.getTime() / 1000);
}

// 比较版本大小
const compareVersions = (version1 = "", version2 = "") => {
  // 将版本号按点号分割成数组
  const parts1 = version1.split(".").map(Number);
  const parts2 = version2.split(".").map(Number);

  // 获取最长的版本号长度
  const maxLength = Math.max(parts1.length, parts2.length);

  // 循环比较每个部分
  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) {
      return false; // 如果前者大于后者版本，返回 false
    } else if (num1 < num2) {
      return true; // 如果前者小于后者版本，返回 true
    }
  }

  // 如果版本号完全相等，返回 false
  return false;
}

// 调用停止加速客户端方法
const stopProxy = async (t = null) => {
  return new Promise((resolve, reject) => {
    try {
      window.NativeApi_AsynchronousRequest(
        "NativeApi_StopProxy",
        JSON.stringify({
          params: {
            user_token: localStorage.getItem("token"),
            js_key: localStorage.getItem("StartKey"),
          },
        }),
        (respose) => {
          tracking.trackBoostDisconnectPassive(0);

          // 加速时服务端返回703异常弹窗
          if (t === 703) {
            eventBus.emit("showModal", { show: true, type: "serverFailure" });
          }

          resolve(true); // 成功
        }
      );
    } catch (error) {
      reject(false); // 失败
    }
  });
};

export {
  compareVersions,
  stopProxy,
  getCouponTimeLock
}