/*
 * @Author: zhangda
 * @Date: 2024-04-16 14:11:44
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-19 14:19:55
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\routes\index.tsx
 */
import { Navigate } from "react-router-dom";

import GameList from "@/pages/GameList";
import Home from "@/pages/Home";
import GameDetail from "@/pages/Home/GameDetail";
import MyGames from "@/pages/MyGames";

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
    element: <Navigate to="/home" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
