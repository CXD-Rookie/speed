/*
 * @Author: zhangda
 * @Date: 2024-06-24 15:45:14
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-24 16:45:20
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\ThirdPartyLogin\index.tsx
 */
import React, { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import "./index.scss";
import loginApi from "@/api/login";

interface ThirdPartyLoginProps {}

const ThirdPartyLogin: React.FC<ThirdPartyLoginProps> = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const login = async (params: any) => {
    try {
      let res = await loginApi.thirdPartyLogin({
        tid: 2,
        platform: 3,
        ...params,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    let code = searchParams.get("code");
    console.log(location, searchParams.get("code"), "进入第三方登录页");
    login({ code });
  }, []);

  return <div className="third-party-login">登录成功</div>;
};

export default ThirdPartyLogin;
