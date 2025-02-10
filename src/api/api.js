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
    const localMchannel = localStorage.getItem("mchannel");
    const adid = localStorage.getItem("adid"); // 推广adid

    const noToken = ["api/v1/game/process/blacklist"]; // 不需要传userToken的接口
    const isToken = noToken.some((item) => config?.url.includes(item)); // 不需要传userToken的接口
    
    const userIdApi = ["api/v1/game/list"]
    const isUserId = userIdApi.some((item) => config?.url.includes(item)); // 需要传userid的接口
    const user_id = localStorage.getItem("userId"); // user_id

    if (token && token !== "undefined" && !isToken) {
      config.headers.user_token = JSON.parse(localStorage.getItem("token")) || ""
    }

    if (token && isUserId) {
      config.headers.user_id = user_id
    }

    config.headers.Mchannel = localMchannel;
    config.headers.Adid = adid; // 

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
    const message = response?.data?.message?.slice(0, 132);

    if (code > 0) {
      const webVersion = process.env.REACT_APP_VERSION;
      const clientVersion = window.versionNowRef;

      const client_code = [100001];
      const not_allowed = ["/api/v1/user/loginout"] // 不需要校验错误码的接口
      const isAllow = not_allowed.some((item) => url.includes(item)); // 未在这些接口中找到
      
      if (client_code.includes(code)) {
        window.NativeApi_AsynchronousRequest("UpdateClientToken", "", (res) => console.log(res))
      } else if (code >= 100000 && code < 200000 && code !== 100001 && !isAllow) {
        window.loginOutStopWidow("api"); // 退出登录
      }
      
      tracking.trackServerError(`errorCode=${code};msg=${message};apiName=${url};version=${clientVersion + "," + webVersion}`);
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
