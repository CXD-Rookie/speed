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

/**
 * 比较两个版本号的大小
 * @param {string} version1 - 第一个版本号，格式如 "1.0.0.1024"
 * @param {string} version2 - 第二个版本号，格式如 "1.0.0.1024"
 * @returns {Object} 返回一个对象，包含比较结果的关系（1 表示 version1 大于 version2，2 表示 version1 小于 version2，3 表示 version1 等于 version2），以及 max 和 min 字段分别表示大的版本号和小的版本号
 */
function compareVersions (version1 = "1.0.0.1", version2 = "1.0.0.1") {
  // 将版本号字符串按点号分割成数组
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    // 处理版本号位数不同的情况，缺少的部分默认为 0
    const num1 = i < v1Parts.length ? v1Parts[i] : 0;
    const num2 = i < v2Parts.length ? v2Parts[i] : 0;

    if (num1 > num2) {
      return { relation: 1, max: version1, min: version2 };
    } else if (num1 < num2) {
      return { relation: 2, max: version2, min: version1 };
    }
  }

  // 如果前面的部分都相等，则两个版本号相等
  return { relation: 3, max: version1, min: version1 };
}; 

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

  if (Number(code) !== 200) {
    tracking.trackBoostDisconnectPassive(`server=${code};version=${clientVersion + "," + webVersion}`);
  }

  console.log(code);
  window.stopProcessReset(); // 退出码，异常退出，只做停止加速
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
const exceptionReport = async (code, value) => {
  if (code) {
    const decodedValue = atob(value); // 解密base64字符串
    console.log(decodedValue, value);
    const errorGameInfo = localStorage.getItem("gameErrorInfo");
    const errorGame = errorGameInfo ? JSON.parse(errorGameInfo) : {};
    const addr = (errorGame?.node_history ?? []).find(item => item?.is_select);
    const webVersion = process.env.REACT_APP_VERSION; // 前端版本号
    const clientVersion = window.versionNowRef; // 客户端版本号
    
    // 无感知停止加速，再开始加速
    tracking.trackBoostDisconnectPassive(`client=${code};msg=${errorGame?.name}${addr?.addr}${decodedValue};version=${clientVersion + "," + webVersion}`);
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