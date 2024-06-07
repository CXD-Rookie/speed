/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-17 10:57:02
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-30 19:35:39
 * @FilePath: \speed\src\api\api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';
import { message } from 'antd';

const instance = axios.create({
  // baseURL: 'http://192.168.111.119:8002', // 根据实际情况设置基础 URL
  // baseURL: 'https://test-api.accessorx.com',
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 请求超时时间（毫秒）
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || '';

    // config.headers.client_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJyZGZnc2RmLWFtZmhmdC1tZm1lcnQtYWRmYWRmZy1nZGZzZ2YiLCJjbGllbnRfaXAiOiIxOTIuMTY4LjExMS4xMTQiLCJleHAiOjE3MTc5MjQ3NTB9.XeRdPymxRETvPHZO8AzLt2zdqlXP_E18mZZTxU5Kk3U"
    // config.headers.client_id = "rdfgsdf-amfhft-mfmert-adfadfg-gdfsgf"

    // config.headers.client_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJyZGZnc2RmLWFtZmhmdC1tZm1lcnRhYS1hZGZhZGZnZHMtZ2Rmc2dmIiwiY2xpZW50X2lwIjoiMTI3LjAuMC4xIiwiZXhwIjoxNzE5NjMxOTI4fQ.r_n6n8fbRxpSNVr3R5DaHYh5plUu10SXPa6fYstsdRk';
    // config.headers.client_id = 'rdfgsdf-amfhft-mfmertaa-adfadfgds-gdfsgf';
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
    return response.data;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        message.error('登录过期，请重新登录');
      } else {
        message.error('网络错误，请稍后再试');
      }
    } else if (error.request) {
      console.log('网络错误，请检查您的网络连接');
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

export default instance;
