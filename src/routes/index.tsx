import { Navigate } from "react-router-dom";

import GameList from "@/pages/GameList";
import Home from "@/pages/Home";
import GameDetail from "@/pages/GameDetail";
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
    // 路由重定向
    path: "/",
    element: <Navigate to="/home" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
