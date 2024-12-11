import { getCouponTimeLock } from "@/layout/utils";
import { store } from "@/redux/store";
class Tracking {
  constructor() {
    const signChannel = ["berrygm", "youxia", "accessorx", "dualspring", "jsqali213", "baidu"];
    const localMchannel = localStorage.getItem("mchannel");

    this.localMchannel = localMchannel;
    this.mchannel = signChannel.includes(localMchannel) ? localMchannel : "other";
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
              : "youXia"
            : 0; // 手机登录 | 游侠登录 | 未登录
        const isReal = localStorage.getItem("isRealName") === "0" ? 1 : 0 // 实名认证 0 未认证 1 认证
        const webVersion = process.env.REACT_APP_VERSION;
        const clientVersion = window.versionNowRef;
        
        if (isVisit === 1) {
          localStorage.setItem("firstActiveTime", String(timeLock));
        }

        localStorage.setItem("activeTime", String(timeLock));
        this.trackEvent(
          this.mchannel,
          "active_foreground",
          `firstDay=${isVisit};method=${method}${method ? ";realName=" + isReal : ""};version=${clientVersion + "," + webVersion};editedChannelID=${this.localMchannel}`,
        );
      }
    });
    
    if (this.mchannel) {
      this.trackEvent(this.mchannel, "active_background", `editedChannelID=${this.localMchannel}`);
    }

    // 定时每10小时发送一次后台活跃
    setInterval(() => {
      this.trackEvent(this.mchannel, "active_background", `editedChannelID=${this.localMchannel}`);
    }, 60 * 60 * 10 * 1000);
  }

  trackEvent(category, action, label, value) {
    window._czc.push(["_trackEvent", category, action, label, value]);
  }

  trackSignUpSuccess (status, firstVisit) {
    this.trackEvent(this.mchannel, "signUp_success", `firstDay=${firstVisit};method=${status};editedChannelID=${this.localMchannel}`);
  }

  trackLoginSuccess (status) {
    this.trackEvent(this.mchannel, "login_success", `method=${status};editedChannelID=${this.localMchannel}`);
  }

  trackBoostStart(value, firstVisit) {
    this.trackEvent(this.mchannel, "boost_start", `firstDay=${firstVisit};entrance=${value};editedChannelID=${this.localMchannel}`);
  }

  trackBoostSuccess(firstVisit) {
    this.trackEvent(
      this.mchannel,
      "boost_success",
      `firstDay=${firstVisit};editedChannelID=${this.localMchannel}`
    );
  }

  trackBoostFailure(errorCode) {
    this.trackEvent(this.mchannel, "boost_failure", errorCode + `;editedChannelID=${this.localMchannel}`);
  }
 
  trackBoostDisconnectManual() {
    this.trackEvent(this.mchannel, "boost_disconnect_manual", `;editedChannelID=${this.localMchannel}`);
  }

  trackBoostDisconnectPassive(reason) {
    this.trackEvent(this.mchannel, "boost_disconnect_passive", reason + `;editedChannelID=${this.localMchannel}`);
  }

  trackPurchasePageShow(value) {
    this.trackEvent(this.mchannel, "purchase_page_show", `entrance=${value};editedChannelID=${this.localMchannel}`);
  }

  trackPurchaseFailure(buyCount) {
    this.trackEvent(this.mchannel, "purchase_failure", `errorCode=${buyCount};editedChannelID=${this.localMchannel}` );
  }
  
  trackPurchaseSuccess (buyCount) {
    this.trackEvent(this.mchannel, "purchase_success", buyCount + `;editedChannelID=${this.localMchannel}`);
  }
  
  trackPurchaseFirstBuy() {
    this.trackEvent(this.mchannel, "banner_firstBuy_show", `editedChannelID=${this.localMchannel}`, null);
  }

  trackPurchaseFirstShow() {
    this.trackEvent(this.mchannel, "banner_firstReneWal_show", `editedChannelID=${this.localMchannel}`, null);
  }

  trackPurchaseFirstBuySuccess() {
    this.trackEvent(this.mchannel, "banner_firstBuy_success", `editedChannelID=${this.localMchannel}`);
  }

  trackPurchaseFirstShowSuccess() {
    this.trackEvent(this.mchannel, "banner_firstReneWal_success", `editedChannelID=${this.localMchannel}`);
  }

  trackRedemption(value) {
    this.trackEvent(this.mchannel, "redemption_success", value + `;editedChannelID=${this.localMchannel}`);
  }

  trackNetworkError(errorCode) {
    this.trackEvent(this.mchannel, "error_frontend", `errorCode=${errorCode};editedChannelID=${this.localMchannel}`);
  }

  trackServerError (error) {
    this.trackEvent(this.mchannel, "error_server", error + `;editedChannelID=${this.localMchannel}`);
  }

  // 是否是首次活跃
  trueOrFalseFirstVisit() {
    // 根据localStorage是否存储过 activeTime 返回 0 是 非首次 或 1 是 首次
    const foreground = localStorage.getItem("activeTime"); // 每天定时00点时间锁

    return Boolean(foreground) ? 0 : 1;
  }
}
  
export default new Tracking();
  