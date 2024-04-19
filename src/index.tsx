/*
 * @Author: zhangda
 * @Date: 2024-04-16 14:11:44
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-19 14:14:51
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\index.tsx
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ConfigProvider } from "antd";

// 语言汉化
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";

import "./assets/css/index.css";
import "dayjs/locale/zh-cn";

import store from "./redux/store";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

dayjs.locale("zh-cn");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN}>
        <Provider store={store}>
          <App />
        </Provider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
