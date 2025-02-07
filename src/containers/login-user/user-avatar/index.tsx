/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 15:23:47
 * @FilePath: \speed\src\containers\login-user\user-avatar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Avatar } from "antd";
import "./index.scss";

import avatarVipIcon from "@/assets/images/common/avatar-vip.svg";

interface UserAvatarComProps {
  isVip?: boolean;
  isLogin?: boolean;
  type?: string;
}

// 接收一个图片路径作为参数，图片进行webpack字符化


const UserAvatarCom: React.FC<UserAvatarComProps> = (props) => {
  const { isVip = false, isLogin = false, type = "default" } = props;
  const is_local = process.env.REACT_APP_LOACL_IMAGE === "0";
  const defaultAvatarUrl =
    is_local && process.env.REACT_APP_IMAGE_AVATAR_DEFAULT
      ? typeof require(process.env.REACT_APP_IMAGE_AVATAR_DEFAULT as string) ===
        "string"
        ? require(process.env.REACT_APP_IMAGE_AVATAR_DEFAULT as string)
        : require(process.env.REACT_APP_IMAGE_AVATAR_DEFAULT as string).default
      : process.env.REACT_APP_IMAGE_AVATAR_DEFAULT || "";
  const empryUrl =
    is_local && process.env.REACT_APP_IMAGE_AVATAR_EMPTY
      ? typeof require(process.env.REACT_APP_IMAGE_AVATAR_EMPTY as string) ===
        "string"
        ? require(process.env.REACT_APP_IMAGE_AVATAR_EMPTY as string)
        : require(process.env.REACT_APP_IMAGE_AVATAR_EMPTY as string).default
      : process.env.REACT_APP_IMAGE_AVATAR_EMPTY || "";
  
  const styleTypeObj: any = {
    default: {
      style: { border: isVip ? "0.2vw solid #ffe3b6" : "none" },
      class: "",
    },
    edit: {
      style: { border: isVip ? "0.2vw solid #ffe3b6" : "none" },
      class: "user-edit-avatar-com-module",
    },
    setting: {
      style: {},
      class: "setting-user-avatar-com-module",
    },
  };
  
  return (
    <div className={`user-avatar-com-module ${styleTypeObj?.[type]?.class}`}>
      <Avatar
        style={styleTypeObj?.[type]?.style}
        src={isLogin ? defaultAvatarUrl : empryUrl}
      />
      {type === "edit" && isVip && (
        <img className="vip-icon" src={avatarVipIcon} alt="" />
      )}
    </div>
  );
};

export default UserAvatarCom;
