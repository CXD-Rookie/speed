/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-21 20:47:13
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-21 17:03:44
 * @FilePath: \speed\src\routes\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Navigate } from "react-router-dom";

import GameLibrary from "@/pages/GameLibrary";
import GameList from "@/pages/GameList";
import Home from "@/pages/Home";
import GameDetail from "@/pages/Home/GameDetail";
import MyGames from "@/pages/Home/MyGames";
import Login from "@/containers/Login";
import PrivateRoute from "./PrivateRoute";

export default [
  {
    path: "/gameLibrary",
    element: (
      <PrivateRoute>
        <GameLibrary />
      </PrivateRoute>
    ),
  },
  {
    path: "/gameList",
    element: (
      <PrivateRoute>
        <GameList />
      </PrivateRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
  },
  {
    path: "/gameDetail",
    element: (
      <PrivateRoute>
        <GameDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/myGames",
    element: (
      <PrivateRoute>
        <MyGames />
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
