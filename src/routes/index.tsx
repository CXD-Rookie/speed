/*
 * @Author: zhangda
 * @Date: 2024-04-16 14:11:44
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-21 20:59:42
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\routes\index.tsx
 */
import { Navigate } from "react-router-dom";

import GameList from "@/pages/GameList";
import Home from "@/pages/Home";
import GameDetail from "@/pages/Home/GameDetail";
import MyGames from "@/pages/Home/MyGames";
import Login from "@/containers/Login";
export default [
  {
    path: "/gameList",
    element: <GameList />,
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
    path: "/myGames",
    element: <MyGames />,
  },
  {
    // 路由重定向
    path: "/",
    element: <Navigate to="/Login" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
