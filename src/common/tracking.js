import { getCouponTimeLock } from "@/layout/utils";
import { store } from "@/redux/store";
class Tracking {
  constructor() {
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
        const webVersion = process.env.REACT_APP;
        const clientVersion = window.versionNowRef;

        localStorage.setItem("activeTime", String(timeLock));
        this.trackEvent(
          "活跃",
          "active_foreground",
          `firstVisit=${isVisit};method=${method};${method ? ";realName=" + isReal : ""};version=${clientVersion + "," + webVersion}`
        );
      }
    });

    // 定时每10小时发送一次后台活跃
    setInterval(() => {
      this.trackEvent("活跃", "active_background");
    }, 60 * 60 * 10 * 1000);

    // 后台活跃
    // document.addEventListener('visibilitychange', () => {
    //   if (document.visibilityState === 'hidden') {
    //     this.trackEvent("活跃", "active_background", "youXia", this.trueOrFalseYouXia());
    //     this.trackEvent("活跃", "active_background", "firstVisit", this.trueOrFalseFirstVisit());
    //   }
    // });
  }

  trackEvent(category, action, label, value) {
    window._czc.push(["_trackEvent", category, action, label, value]);
  }

  trackSignUpSuccess(status) {
    this.trackEvent("登录注册", "signUp_success", `method=${status}`);
  }

  trackLoginSuccess (status) {
    this.trackEvent("登录注册", "login_success", `method=${status}`);
  }

  trackSignUpFailure(errorCode) {
    this.trackEvent("登录注册", "signUp_failure", "errorCode", errorCode);
  }

  trackLoginFailure(errorCode) {
    this.trackEvent("登录注册", "login_failure", "errorCode", errorCode);
  }

  trackBoostStart(value, firstVisit) {
    this.trackEvent("加速", "boost_start", `entrance=${value};firstVisit=${firstVisit}`);
  }

  trackBoostSuccess(gameName, region, node, firstVisit) {
    this.trackEvent(
      "加速",
      "boost_success",
      `gameName=${gameName};region=${region};node=${node};firstVisit=${firstVisit}`
    );
  }

  trackBoostFailure(errorCode) {
    this.trackEvent("加速", "boost_failure", errorCode);
  }
 
  trackBoostDisconnectManual(time) {
    this.trackEvent("加速", "boost_disconnect_manual", `time=${time}`);
  }

  trackBoostDisconnectPassive(reason) {
    this.trackEvent("加速", "boost_disconnect_passive", reason, reason);
  }

  trackPurchasePageShow(value) {
    this.trackEvent("付费页", "purchase_page_show", `entrance=${value}`);
  }

  trackPurchaseFailure(buyCount) {
    this.trackEvent("付费页", "purchase_failure", `errorCode=${buyCount}` );
  }
  
  trackPurchaseSuccess(buyCount) {
    this.trackEvent("付费页", "purchase_success", buyCount);
  }

  trackPurchaseFirstBuy() {
    this.trackEvent("活动页", "banner_firstBuy_show");
  }

  trackPurchaseFirstShow() {
    this.trackEvent("活动页", "banner_firstReneWal_show");
  }

  trackPurchaseFirstBuySuccess() {
    this.trackEvent("活动页", "banner_firstBuy_success");
  }

  trackPurchaseFirstShowSuccess() {
    this.trackEvent("活动页", "banner_firstReneWal_success");
  }

  trackRedemption(value) {
    this.trackEvent("口令码", "redemption_success", value);
  }

  trackNetworkError(errorCode) {
    this.trackEvent("报错", "error_frontend", `errorCode=${errorCode}`);
  }

  trackServerError (errorCode) {
    this.trackEvent("报错", "error_server", `errorCode=${errorCode}`);
  }

  // 是否是首次
  trueOrFalseYouXia() {
    // 根据localStorage是否存储过 activeTime 返回 0 是 非首次 或 1 是 首次
    const foreground = localStorage.getItem("activeTime"); // 每天定时00点时间锁
    console.log(Boolean(foreground));

    return Boolean(foreground) ? 0 : 1;
  }

  // 是否是首次活跃
  trueOrFalseFirstVisit() {
    // 根据localStorage是否存储过 activeTime 返回 0 是 非首次 或 1 是 首次
    const foreground = localStorage.getItem("activeTime"); // 每天定时00点时间锁

    return Boolean(foreground) ? 0 : 1;
  }
}
  
export default new Tracking();
  