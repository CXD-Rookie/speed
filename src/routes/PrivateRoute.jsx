import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token"); // 假设 token 存储在 localStorage 中
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
