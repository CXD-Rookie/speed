import { Navigate } from "react-router-dom";

import About from "@/pages/about";
import Home from "@/pages/home";

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
    // 路由重定向
    path: "/",
    element: <Navigate to="/home" />,
  },
] as {
  path: string;
  element: JSX.Element;
}[];
