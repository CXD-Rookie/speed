/*
 * @Author: zhangda
 * @Date: 2024-04-16 14:11:44
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-16 18:02:54
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\routes\index.tsx
 */
import { Navigate } from "react-router-dom";

import About from "@/pages/About";
import Home from "@/pages/Home";
import GameDetail from "@/pages/GameDetail";

export default [
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/gameDetail",
    element: <GameDetail />,
  },
  {
    // 路由重定向
    path: "/",
    element: <Navigate to="/home" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
