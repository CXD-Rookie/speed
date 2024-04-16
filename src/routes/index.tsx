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
