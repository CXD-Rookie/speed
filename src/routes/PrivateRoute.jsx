import React from "react";
import { Navigate } from "react-router-dom";
import Login from "@/containers/Login"
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token"); // 假设 token 存储在 localStorage 中
  return  children;
};

export default PrivateRoute;
