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
          // console.log(t, respose);
          
          // if (t >= 600) {
          //   const webVersion = process.env.REACT_APP_VERSION; // 前端版本号
          //   const clientVersion = window.versionNowRef; // 客户端版本号

          //   tracking.trackBoostDisconnectPassive(`client=${t};version=${clientVersion + "," + webVersion}`);
          // }

          // // 加速时服务端返回703异常弹窗
          // if (t === 703) {
          //   eventBus.emit("showModal", { show: true, type: "serverFailure" });
          // }

          resolve(true); // 成功
        }
      );
    } catch (error) {
      reject(false); // 失败
    }
  });
};

// 服务端 客户端错误码上报
const serverClientReport = (code) => {
  const reportCode = [ 803, 804 ];
  const rechargeReportCode = [ 801 ];
  const disconnecReportCode = [601, 602, 701, 702, 703, 704, 802];
  const webVersion = process.env.REACT_APP_VERSION; // 前端版本号
  const clientVersion = window.versionNowRef; // 客户端版本号

  // 如果是上报码 只做埋点上报
  if (reportCode.includes(Number(code))) {
    console.log(code);
    tracking.trackBoostDisconnectPassive(`server=${code};version=${clientVersion + "," + webVersion}`);
    return;
  }

  // 充值到期错误码 停止加速 提示到期 上报埋点
  if (rechargeReportCode.includes(Number(code))) {
    console.log(code);
    tracking.trackBoostDisconnectPassive(`server=${code};version=${clientVersion + "," + webVersion}`);
    window.stopProcessReset();
    eventBus.emit("showModal", { show: true, type: "serviceExpired" });
    
    return;
  }

  // 加速服务异常断开 停止加速 提示异常 上报埋点
  if (disconnecReportCode.includes(Number(code))) {
    console.log(code);
    tracking.trackBoostDisconnectPassive(`server=${code};version=${clientVersion + "," + webVersion}`);

    // 802做展示
    if ([601, 602, 701, 702, 703, 704].includes(Number(code))) {
      stopProxy(); // 停止加速进程不做ui展示

      const list = localStorage.getItem("speed-1.0.0.1-games");
      const data = list ? JSON.parse(list) : [];
      const option = data.find(item => item?.is_accelerate);

      let num = 1;

      suitDom(num, option);
    } else {
      const eventBuNetwork = localStorage.getItem("eventBuNetwork");
      
      window.stopProcessReset();

      // 如果网络断开弹窗已经弹出
      if (!(eventBuNetwork === "1")) {
        eventBus.emit("showModal", { show: true, type: "servicerechargeReport" });
      }
    }

    return;
  }

  console.log(code);
  if (code) {
    tracking.trackBoostDisconnectPassive(`server=${code};version=${clientVersion + "," + webVersion}`);
  }
  // 退出码，异常退出，只做停止加速
  window.stopProcessReset();
}

const suitDom = async (num, option) => {
  console.log(num, option);
  
  if (num <= 3) {
    const time = { 2: 10000, 3: 20000 };

    setTimeout(async () => {
      const state = await window.handleSuitDomList(option); // 通知客户端进行加速
      console.log("加速信息", state, num, option);

      if (!state?.state) {
        num++;
        suitDom(num, option)
      }
    }, time?.[num] || 0);
  } else {
    const eventBuNetwork = localStorage.getItem("eventBuNetwork");

    window.stopProcessReset();

    // 如果网络断开弹窗已经弹出
    if (!(eventBuNetwork === "1")) {
      eventBus.emit("showModal", { show: true, type: "servicerechargeReport" });
    }
  }
}

// 异常原因上报
const exceptionReport = async (value) => {
  if (value) {
    // const decodedString = atob(value);
    // console.log(decodedString, value);

    const webVersion = process.env.REACT_APP_VERSION; // 前端版本号
    const clientVersion = window.versionNowRef; // 客户端版本号

    // 无感知停止加速，再开始加速
    tracking.trackBoostDisconnectPassive(`client=${value};version=${clientVersion + "," + webVersion}`);
    stopProxy(); // 停止加速进程不做ui展示

    const list = localStorage.getItem("speed-1.0.0.1-games");
    const data = list ? JSON.parse(list) : [];
    const option = data.find(item => item?.is_accelerate);

    let num = 1;

    suitDom(num, option);
  }
}

export {
  compareVersions,
  stopProxy,
  getCouponTimeLock,
  serverClientReport,
  exceptionReport
}