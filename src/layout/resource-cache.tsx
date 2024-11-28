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
import currencyIcon from "@/assets/images/home/currency.png";
import currencyBanner from "@/assets/images/common/currency-banner.png";
import noDataIcon from "@/assets/images/common/no-data.svg";
import versionCloseIcon from "@/assets/images/common/version-close.svg";
import rightIcon from "@/assets/images/common/fanhui.svg";
import divergentIcon from "@/assets/images/common/divergent-animation.png";
import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";
import loseIcon from "@/assets/images/common/yishiyong.svg";
import expiresIcon from "@/assets/images/common/yiguoqi.svg";
import defaultAvatarIcon from "@/assets/images/common/default-avatar.svg";
import avatarVipIcon from "@/assets/images/common/avatar-vip.svg";
import noLoginIcon from "@/assets/images/common/no-login-avatar.svg";
import realErrorIcon from "@/assets/images/common/real_error_quan.svg";
import realSucessIcon from "@/assets/images/common/real-sucess.svg";
import exclErrorIcon from "@/assets/images/common/excl.svg";
import refreshIcon from "@/assets/images/common/refresh.png";
import rightArrowIcon from "@/assets/images/common/right-search-arrow.svg";
import searchIcon from "@/assets/images/common/search.svg";
import fixImg from "@/assets/images/fix-utils/fix@2x.png";
import fixImg_3 from "@/assets/images/fix-utils/fix3@2x.png";
import fixImg_6 from "@/assets/images/fix-utils/fix6@2x.png";
import fixImg_success from "@/assets/images/fix-utils/fix_success@2x.png";
import fix_failure from "@/assets/images/fix-utils/fix_failure@2x.png";
import youIcon from "@/assets/images/common/you@2x.png";
import leftIcon from "@/assets/images/common/zuo@2x.png";
import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import updateIcon from "@/assets/images/common/update.png";
import emptyIcon from "@/assets/images/home/empty.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
import gamesBlackIcon from "@/assets/images/home/games_black.png";
import deAccelerateIcon from "@/assets/images/common/details-accelerate.svg";
import activateIcon from "@/assets/images/common/activate.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";
import detailsCustomIcon from "@/assets/images/common/details-custom.svg";
import backGameIcon from "@/assets/images/common/back-game.svg";
import steamIcon from "@/assets/images/common/steam@2x.png";
import rockstarIcon from "@/assets/images/common/rockstar@2x.png";
import battleIcon from "@/assets/images/common/Battlenet@2x.png";
import eaIcon from "@/assets/images/common/EA_App_2022_icon@2x.png";
import epicIcon from "@/assets/images/common/Epic@2x.png";
import faceitIcon from "@/assets/images/common/faceit@2x.png";
import microsoftIcon from "@/assets/images/common/Microsoft store@2x.png";
import oculusIcon from "@/assets/images/common/Oculus@2x.png";
import garenaIcon from "@/assets/images/common/Garena@2x.png";
import galaxyIcon from "@/assets/images/common/GOG Galaxy@2x.png";
import primeGamIcon from "@/assets/images/common/Prime Gaming@2x.png";
import toggleIcon from "@/assets/images/home/toggle.png";

const ResourceCache: React.FC = () => {
  return (
    <div style={{ display: "none" }}>
      {/* 游戏详情不同平台icon */}
      <img src={eaIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={epicIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={faceitIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={microsoftIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={oculusIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={garenaIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={galaxyIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={primeGamIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={toggleIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={steamIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={rockstarIcon} alt="" />
      {/* 游戏详情不同平台icon */}
      <img src={battleIcon} alt="" />
      {/* 游戏详情停止加速icon */}
      <img src={detailsCustomIcon} alt="" />
      {/* 游戏详情返回首页icon */}
      <img src={backGameIcon} alt="" />
      {/* 游戏详情遮罩层icon */}
      <img src={deAccelerateIcon} alt="" />
      {/* 游戏详情启动icon */}
      <img src={activateIcon} alt="" />
      {/* 游戏详情服务器icon */}
      <img src={computerIcon} alt="" />
      {/* 游戏详情路由器icon */}
      <img src={computingIcon} alt="" />
      {/* 游戏详情电脑icon */}
      <img src={laptopsIcon} alt="" />
      {/* 首页游戏icon */}
      <img src={gamesIcon} alt="" />
      {/* 首页会员充值icon */}
      <img src={rechargeIcon} alt="" />
      {/* 首页游戏黑色版icon */}
      <img src={gamesBlackIcon} alt="" />
      {/* 结果页没找到数据icon */}
      <img src={emptyIcon} alt="" />
      {/* 头部设置icon */}
      <img src={menuIcon} alt="" />
      {/* 头部缩小icon */}
      <img src={minIcon} alt="" />
      {/* 头部发现新版本icon */}
      <img src={updateIcon} alt="" />
      {/* 优惠活动轮播图右icon */}
      <img src={youIcon} alt="" />
      {/* 优惠活动轮播图左icon */}
      <img src={leftIcon} alt="" />
      {/* 设置页面修复客户端icon */}
      <img src={fixImg} alt="" />
      {/* 设置页面修复客户端icon */}
      <img src={fixImg_3} alt="" />
      {/* 设置页面修复客户端icon */}
      <img src={fixImg_6} alt="" />
      {/* 设置页面修复客户端icon */}
      <img src={fixImg_success} alt="" />
      {/* 设置页面修复客户端icon */}
      <img src={fix_failure} alt="" />
      {/* 搜索页面去查看icon */}
      <img src={rightArrowIcon} alt="" />
      {/* 搜索icon */}
      <img src={searchIcon} alt="" />
      {/* 刷新icon */}
      <img src={refreshIcon} alt="" />
      {/* 实名认证失败icon */}
      <img src={realErrorIcon} alt="" />
      {/* 实名认证成功icon */}
      <img src={realSucessIcon} alt="" />
      {/* 实名认证失败icon */}
      <img src={exclErrorIcon} alt="" />
      {/* 用户头像默认icon */}
      <img src={defaultAvatarIcon} alt="" />
      {/* 用户头像vipicon */}
      <img src={avatarVipIcon} alt="" />
      {/* 用户头像未登录icon */}
      <img src={noLoginIcon} alt="" />
      {/* 优惠券页面已过期icon */}
      <img src={loseIcon} alt="" />
      {/* 优惠券页面未过期icon */}
      <img src={expiresIcon} alt="" />
      {/* 登录手机号icon */}
      <img src={phoneIcon} alt="" />
      {/* 登录验证码icon */}
      <img src={challengeIcon} alt="" />
      {/* 版本升级弹窗关闭icon */}
      <img src={rightIcon} alt="" />
      {/* 版本升级弹窗经过出现图标 */}
      <img src={divergentIcon} alt="" />
      {/* 版本升级弹窗去查看图标 */}
      <img src={versionCloseIcon} alt="" />
      {/* 兑换码页面背景图片 */}
      <img src={currencyBanner} alt="" />
      {/* 没有数据图标 */}
      <img src={noDataIcon} alt="" />
      {/* 新用户弹窗兑换图片 */}
      <img src={currencyIcon} alt="" />
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
