/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 14:31:34
 * @FilePath: \speed\src\containers\login-user\user-avatar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Avatar } from "antd";

import "./index.scss";

import defaultAvatarIcon from "@/assets/images/common/default-avatar.svg";
import avatarVipIcon from "@/assets/images/common/avatar-vip.svg";
import noLoginIcon from "@/assets/images/common/no-login-avatar.svg";

interface UserAvatarComProps {
  isVip?: boolean;
  isLogin?: boolean;
  type?: string;
}

const UserAvatarCom: React.FC<UserAvatarComProps> = (props) => {
  const { isVip = false, isLogin = false, type = "default" } = props;

  return (
    <div className="user-avatar-com-module">
      <Avatar
        style={{
          border: isVip ? "0.1vw solid #ffe3b6" : "none",
        }}
        size={40}
        src={isLogin ? defaultAvatarIcon : noLoginIcon}
      />
      {isVip && <img className="vip-icon" src={avatarVipIcon} alt="" />}
    </div>
  );
};

export default UserAvatarCom;
