/*
 * @Author: zhangda
 * @Date: 2024-06-24 15:45:14
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-22 14:11:25
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\ThirdPartyLogin\index.tsx
 */
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validateRequiredParams } from "@/common/utils";

import "./index.scss";
import loginApi from "@/api/login";

interface ThirdPartyLoginProps {}

const ThirdPartyLogin: React.FC<ThirdPartyLoginProps> = () => {
  const [searchParams] = useSearchParams();

  const login = async (params: any) => {
    try {
      console.log({
        ...params,
        tid: 2,
        platform: 3,
      });

      const reqire = await validateRequiredParams({ code: params?.params });

      if (!reqire) {
        return;
      }

      let res = await loginApi.thirdPartyLogin({
        ...params,
        tid: 2,
        platform: 3,
      });
      
      // 服务端返回的绑定类型
      let state = res?.data?.user_bind_status ?? 0;
      console.log(
        searchParams.get("token"),
        state,
        window.location,
        process.env.REACT_APP_YOUXIA_URL,
        process.env.REACT_APP_API_URL
      );

      if (String(state)) {
        // 关闭第三方登录 并且将token 是否第三方登录 是否新用户 3个参数存储在 加速器项目中
        // (window as any).NativeApi_YouXiaAuthComplete(
        //   res?.data?.token,
        //   state,
        //   res?.data?.is_new_user,
        //   res?.data?.vip_experience_time
        // );
        (window as any).NativeApi_YouXiaAuthComplete(
          JSON.stringify(res?.data),
          state
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let code = searchParams.get("code");
    let token = searchParams.get("token");

    localStorage.setItem("token", JSON.stringify(token));

    login({ code });
  }, []);

  return <div className="third-party-login">登录成功</div>;
};

export default ThirdPartyLogin;
