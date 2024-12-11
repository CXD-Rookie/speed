/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-17 10:57:02
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-15 14:49:03
 * @FilePath: \speed\src\api\api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { store } from '@/redux/store';
import { message } from 'antd';
import { setAccountInfo } from '@/redux/actions/account-info';
import axios from 'axios';
import tracking from "@/common/tracking";
import eventBus from './eventBus';

const instance = axios.create({
  // baseURL: 'https://test-api.accessorx.com', // 根据实际情况设置基础 URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 请求超时时间（毫秒）
});

let default_hooks = {};

export const setupInterceptors = (hooks) => {
  default_hooks = hooks
};

setupInterceptors();
// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || '';
    // const signChannel = ["berrygm", "ali213", "accessorx", "dualspring", "jsqali213", "baidu"];
    // const localMchannel = localStorage.getItem("mchannel");
    // const mchannel = signChannel.includes(localMchannel) ? localMchannel : "other"

    if (token && token !== "undefined") {
      config.headers.user_token = JSON.parse(localStorage.getItem("token")) || ""
    }

    // config.headers.mchannel = mchannel;
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const code = response?.data?.error;
    const url = response?.config?.url
    const message = response?.data?.message;
    
    if (code > 0) {
      let errorCode = [110001];
      const webVersion = process.env.REACT_APP_VERSION;
      const clientVersion = window.versionNowRef;
      
      tracking.trackServerError(`errorCode=${code};message=${message};apiName=${url};version=${clientVersion + "," + webVersion}`)
      // token验证失败 退出登录
      if (errorCode.includes(code)) {
        // window.NativeApi_AsynchronousRequest('NativeApi_StopProxy', '', function (response) {
        //   console.log("Success response from 停止加速:", response);
        //   localStorage.removeItem("token");
        //   localStorage.removeItem("isRealName");

        //   eventBus.emit('clearTimer');
        //   default_hooks.removeGameList("initialize");
        //   default_hooks.historyContext?.accelerateTime?.stopTimer();

        //   if (window.stopDelayTimer) {
        //     window.stopDelayTimer();
        //   }

        //   // 3个参数 用户信息 是否登录 是否显示登录
        //   store.dispatch(setAccountInfo({}, false, true));
        //   window.location.href = process.env.REACT_APP_CDN_URL
        // })
      }
    }
    return response.data;
  },
  error => {
    const webVersion = process.env.REACT_APP_VERSION;
    const clientVersion = window.versionNowRef;
    
    if (error.response) {
      const errorCode = error.response.status;

      if (error.response.status === 401) {
        tracking.trackNetworkError(`errorCode=${errorCode};version=${clientVersion + "," + webVersion}`);
        message.error('登录过期，请重新登录');
      } else {
        tracking.trackNetworkError(`errorCode=${errorCode};version=${clientVersion + "," + webVersion}`);
        message.error('网络错误，请稍后再试');
      }
    } else if (error.request) {
      tracking.trackNetworkError(`errorCode=${error.response.code};version=${clientVersion + "," + webVersion}` )
      // 这里处理断网异常
      // eventBus.emit('showModal', { show: true, type: "netorkError" });
    } else {
      console.log('请求失败，请稍后再试');
    }
    return Promise.reject(error);
  }
);

// 封装 get 请求
export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    instance.get(url, { params })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// 封装 post 请求
export const post = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    instance.post(url, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// 封装 put 请求
export const put = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    instance.put(url, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default instance;
