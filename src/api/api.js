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
import playSuitApi from './speed';
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
    if (token && token !== "undefined") {
      config.headers.user_token = JSON.parse(localStorage.getItem("token")) || ""
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    let code = response?.data?.error;

    if (code > 0) {
      let errorCode = [110001];

      // token验证失败 退出登录
      if (errorCode.includes(code)) {
        window.NativeApi_AsynchronousRequest('NativeApi_StopProxy', '', function (response) {
          console.log("Success response from 停止加速:", response);
          localStorage.removeItem("token");
          localStorage.removeItem("isRealName");
          localStorage.removeItem("is_new_user");
          eventBus.emit('clearTimer');
          default_hooks.removeGameList("initialize");
          default_hooks.historyContext?.accelerateTime?.stopTimer();

          if (window.stopDelayTimer) {
            window.stopDelayTimer();
          }

          // 3个参数 用户信息 是否登录 是否显示登录
          store.dispatch(setAccountInfo({}, false, true));
          // const url = new URL(window.location.origin + "/home");
          // const isHttp = window.location.href.indexOf("http") !== -1
          // const url = new URL(
          //   process.env.REACT_APP_ENV === "development" ? 
          //     (isHttp ? window.location.origin + "/home" : "https://cdn.accessorx.com/web_test/index.html") :
          //     "https://cdn.accessorx.com/web/index.html"
          // )
          // window.location.href = url.toString();

          window.location.href = process.env.REACT_APP_CDN_URL
        })
      }
    }
    return response.data;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        message.error('登录过期，请重新登录');
      } else {
        tracking.trackNetworkError(error.response.status)
        message.error('网络错误，请稍后再试');
      }
    } else if (error.request) {
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
