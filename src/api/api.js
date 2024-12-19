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
    // "ceshi": "ceshi",
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
    const signChannel = [
      "berrygm", 
      "ali213", 
      "accessorx", 
      "dualspring", 
      "jsqali213", 
      "baidu"
    ];
    const localMchannel = localStorage.getItem("mchannel");
    const mchannel = signChannel.includes(localMchannel) ? localMchannel : "other";
    const noToken = ["api/v1/game/process/blacklist"];
    const isToken = noToken.some((item) => config?.url.includes(item));
    
    if (token && token !== "undefined" && !isToken) {
      config.headers.user_token = JSON.parse(localStorage.getItem("token")) || ""
    }

    config.headers.Mchannel = mchannel;
    
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
      const webVersion = process.env.REACT_APP_VERSION;
      const clientVersion = window.versionNowRef;

      const client_code = [100001];

      if (client_code.includes(code)) {
        window.NativeApi_AsynchronousRequest("UpdateClientToken", "", (res) => console.log(res))
        // window.loginOutStopWidow(); // 退出登录
      } else if (code >= 100000 && code < 200000 && code !== 100001) {
        window.loginOutStopWidow(); // 退出登录
      }
      
      tracking.trackServerError(`errorCode=${code};message=${message};apiName=${url};version=${clientVersion + "," + webVersion}`);
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
        // 打印请求头信息
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
