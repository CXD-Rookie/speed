/*
 * @Author: zhangda
 * @Date: 2024-06-24 15:45:14
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-10 11:38:44
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
      console.log({
        ...params,
        tid: 2,
        platform: 3,
      });

      let res = await loginApi.thirdPartyLogin({
        ...params,
        tid: 2,
        platform: 3,
      });
      // 服务端返回的绑定类型
      let state = searchParams.get("token") ? res?.data?.user_bind_status : 0;
      console.log(1111, searchParams.get("token"), location, state);

      if (String(state)) {
        (window as any).NativeApi_YouXiaAuthComplete(res?.data?.token, res?.data?.is_new_user,state);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let code = searchParams.get("code");
    let token = searchParams.get("token");
    let is_new_user = searchParams.get("is_new_user");

    localStorage.setItem("token", JSON.stringify(token));
    localStorage.setItem("is_new_user", JSON.stringify(is_new_user));

    login({ code });
  }, []);

  return <div className="third-party-login">登录成功</div>;
};

export default ThirdPartyLogin;
