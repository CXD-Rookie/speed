import { getCouponTimeLock } from "@/layout/utils";
import { store } from "@/redux/store";
class Tracking {
  constructor() {
    this.otherMchannel = (value = "befter") => {
      const signChannel = JSON.parse(process.env.REACT_APP_PARTNER_CHANNEL || JSON.stringify([]));
      const localMchannel = localStorage.getItem("mchannel");
      const mchannel = signChannel.includes(localMchannel) ? localMchannel : "other";
      const channelId = mchannel === "other" ? `${value === "befter" ? ";" : ""}editedChannelID=${localMchannel}` : "";

      return {
        channelId,
        mchannel
      }
    };
    this.initEventListeners();
  }

  initEventListeners() {
    // 前台活跃 - 任何点击、滚动、输入等操作
    document.addEventListener('click', () => {
      // 点击触发埋点上报时，查询是否是第一次，是第一次上传首次活跃，反之非首次活跃，
      // 每天0点之后允许点击上报一次
      const foreground = localStorage.getItem("activeTime"); // 每天定时00点时间锁
      const currentTime = Math.floor(Date.now() / 1000); // 当前时间

      if (!foreground || currentTime > Number(foreground)) {
        const timeLock = getCouponTimeLock(); // 生成每天定时00点时间锁
        const isVisit = this.trueOrFalseFirstVisit() // 是否首次活跃
        const isLogin = store.getState()?.accountInfo?.isLogin;// 是否登录
        const method = 
          isLogin
            ? localStorage.getItem("loginMethod") === "phone"
              ? "phone"
              : process.env.REACT_APP_TID_SIGN
            : 0; // 手机登录 | 三方登录 | 未登录

        const isReal = localStorage.getItem("isRealName") === "0" ? 1 : 0 // 实名认证 0 未认证 1 认证
        
        if (isVisit === 1) {
          localStorage.setItem("firstActiveTime", String(timeLock));
        }

        // 首次活跃在登录状态下尝试触发引导页
        if (store.getState().accountInfo.isLogin) {
          window.landFirstTrigger(); // 调用引导页弹窗
        }

        localStorage.setItem("activeTime", String(timeLock));
        this.trackEvent(
          this.otherMchannel()?.mchannel,
          "active_foreground",
          `firstDay=${isVisit};method=${method}${method ? ";realName=" + isReal : ""}${this.otherMchannel()?.channelId}`,
        );
      }
    });
    
    // 定时每10小时发送一次后台活跃
    setInterval(() => {
      this.trackEvent(this.otherMchannel()?.mchannel, "active_background", this.otherMchannel("after")?.channelId);
    }, 60 * 60 * 10 * 1000);
  }

  trackEvent(category, action, label, value) {
    window._czc.push(["_trackEvent", category, action, label, value]);
  }

  // 后台活跃
  trackaBackgroundActivity () {
    this.trackEvent(this.otherMchannel()?.mchannel, "active_background", this.otherMchannel("after")?.channelId);
  }

  trackSignUpSuccess (status, firstVisit) {
    this.trackEvent(this.otherMchannel()?.mchannel, "signUp_success", `firstDay=${firstVisit};method=${status}${this.otherMchannel()?.channelId }`);
  }

  trackLoginSuccess (status, firstDay) {
    this.trackEvent(this.otherMchannel()?.mchannel, "login_success", `firstDay=${firstDay};method=${status}${this.otherMchannel()?.channelId }`);
  }

  trackBoostStart(value, firstVisit) {
    this.trackEvent(this.otherMchannel()?.mchannel, "boost_start", `firstDay=${firstVisit};entrance=${value}${this.otherMchannel()?.channelId}`);
  }

  trackBoostSuccess(firstVisit) {
    this.trackEvent(
      this.otherMchannel()?.mchannel,
      "boost_success",
      `firstDay=${firstVisit}${this.otherMchannel()?.channelId}`
    );
  }

  trackBoostFailure(errorCode) {
    this.trackEvent(this.otherMchannel()?.mchannel, "boost_failure", errorCode + this.otherMchannel()?.channelId);
  }
 
  // 停止加速上报
  trackBoostDisconnectManual() {
    this.trackEvent(this.otherMchannel()?.mchannel, "boost_disconnect_manual", this.otherMchannel("after")?.channelId);
  }

  // 关闭客户端上报
  trackBoostActiveCloseClient () {
    this.trackEvent(this.otherMchannel()?.mchannel, "active_close_client", this.otherMchannel("after")?.channelId);
  }

  // 退出登录上报
  trackBoostlogoutSuccess () {
    this.trackEvent(this.otherMchannel()?.mchannel, "logout_success", this.otherMchannel("after")?.channelId);
  }

  trackBoostDisconnectPassive(reason) {
    this.trackEvent(this.otherMchannel()?.mchannel, "boost_disconnect_passive", reason + this.otherMchannel()?.channelId);
  }

  trackPurchasePageShow(value) {
    this.trackEvent(this.otherMchannel()?.mchannel, "purchase_page_show", `entrance=${value}${this.otherMchannel()?.channelId}`);
  }

  trackPurchaseFailure(buyCount) {
    this.trackEvent(this.otherMchannel()?.mchannel, "purchase_failure", `errorCode=${buyCount}${this.otherMchannel()?.channelId}` );
  }
  
  trackPurchaseSuccess (buyCount) {
    this.trackEvent(this.otherMchannel()?.mchannel, "purchase_success", buyCount + this.otherMchannel()?.channelId);
  }
  
  trackPurchaseFirstBuy() {
    this.trackEvent(this.otherMchannel()?.mchannel, "banner_firstBuy_show", this.otherMchannel("after")?.channelId, null);
  }

  trackPurchaseFirstShow() {
    this.trackEvent(this.otherMchannel()?.mchannel, "banner_firstReneWal_show", this.otherMchannel("after")?.channelId, null);
  }

  trackPurchaseFirstBuySuccess() {
    this.trackEvent(this.otherMchannel()?.mchannel, "banner_firstBuy_success", this.otherMchannel("after")?.channelId);
  }

  trackPurchaseFirstShowSuccess() {
    this.trackEvent(this.otherMchannel()?.mchannel, "banner_firstReneWal_success", this.otherMchannel("after")?.channelId);
  }

  trackRedemption(value) {
    this.trackEvent(this.otherMchannel()?.mchannel, "redemption_success", value + this.otherMchannel()?.channelId);
  }

  trackNetworkError(errorCode) {
    this.trackEvent(this.otherMchannel()?.mchannel, "error_frontend", `errorCode=${errorCode}${this.otherMchannel()?.channelId}`);
  }

  trackServerError (error) {
    this.trackEvent(this.otherMchannel()?.mchannel, "error_server", error + this.otherMchannel()?.channelId);
  }

  // 是否是首次活跃
  trueOrFalseFirstVisit() {
    // 根据localStorage是否存储过 activeTime 返回 0 是 非首次 或 1 是 首次
    const foreground = localStorage.getItem("activeTime"); // 每天定时00点时间锁

    return Boolean(foreground) ? 0 : 1;
  }
}
  
export default new Tracking();
  