// 资源缓存区
import React from "react";

import loadingGif from "@/assets/images/common/jiazai.gif";
import newUserIcon from "@/assets/images/home/new-user.png";
import visitorLoginIcon from "@/assets/images/common/visitor-login.svg";
import logoIcon from "@/assets/images/common/logo.png";
import bannerRechargeIcon from "@/assets/images/common/banner-recharge.png";
import bannerRenewalIcon from "@/assets/images/common/banner-renewal.png";
import updateBagIcon from "@/assets/images/common/update-bag.png"
import activeIcon from "@/assets/images/home/active2@2x.png";
import firstIcon from "@/assets/images/home/first1@2x.png";

const ResourceCache: React.FC = () => {
  return (
    <div style={{ display: "none" }}>
      {/* 加载动画gif */}
      <img src={loadingGif} alt="" />
      {/* 新用户弹窗 */}
      <img src={newUserIcon} alt="" />
      {/* 游侠图标 */}
      <img src={visitorLoginIcon} alt="" />
      {/* 登录logo */}
      <img src={logoIcon} alt="" />
      {/* 用户信息充值图片 */}
      <img src={bannerRenewalIcon} alt="" />
      {/* 用户信息续费图片 */}
      <img src={bannerRechargeIcon} alt="" />
      {/* 更新背景图片 */}
      <img src={updateBagIcon} alt="" />
      {/* 首续支付背景图片 */}
      <img src={activeIcon} alt="" />
      {/* 首充支付背景图片 */}
      <img src={firstIcon} alt="" />
    </div>
  );
};

export default ResourceCache;
