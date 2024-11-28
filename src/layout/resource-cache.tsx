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
import humanStartOIcon from "@/assets/images/common/human-start-o.png";
import autoStartOIcon from "@/assets/images/common/auto-start-o.png";
import humanStartWIcon from "@/assets/images/common/human-start-w.png";
import autoStartWIcon from "@/assets/images/common/auto-start-w.png";
import tickIcon from "@/assets/images/common/tick.png";
import closeIcon from "@/assets/images/common/cloture.svg";
import addIcon from "@/assets/images/common/add.svg";
import select from "@/assets/images/home/select@2x.png";
import cardClearIcon from "@/assets/images/common/close.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import rightArrow from "@/assets/images/common/right-arrow.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import addThemeIcon from "@/assets/images/common/add-theme.svg";

const ResourceCache: React.FC = () => {
  return (
    <div style={{ display: "none" }}>
      {/* 加速卡片添加图标 */}
      <img src={addIcon} alt="" />
      {/* 加速卡片选择区服图标 */}
      <img src={select} alt="" />
      {/* 加速卡片清除图标 */}
      <img src={cardClearIcon} alt="" />
      {/* 加速卡片右箭头图标 */}
      <img src={arrowIcon} alt="" />
      {/* 加速卡片加速图标 */}
      <img src={accelerateIcon} alt="" />
      {/* 加速卡片右箭头图标 */}
      <img src={rightArrow} alt="" />
      {/* 加速卡片加速中图标 */}
      <img src={acceleratedIcon} alt="" />
      {/* 加速卡片停止加速图标 */}
      <img src={cessationIcon} alt="" />
      {/* 新用户领取关闭图标 */}
      <img src={addThemeIcon} alt="" />
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
      {/* 手动启动图标 */}
      <img src={humanStartOIcon} alt="" />
      {/* 自动启动图标 */}
      <img src={autoStartOIcon} alt="" />
      {/* 手动启动图标 */}
      <img src={humanStartWIcon} alt="" />
      {/* 自动启动图标 */}
      <img src={autoStartWIcon} alt="" />
      {/* 启动平台图标 */}
      <img src={tickIcon} alt="" />
      {/* 新用户领取关闭图标 */}
      <img src={closeIcon} alt="" />
    </div>
  );
};

export default ResourceCache;
