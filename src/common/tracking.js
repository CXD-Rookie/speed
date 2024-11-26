class Tracking {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    // 前台活跃 - 任何点击、滚动、输入等操作
    document.addEventListener('click', () => {
      this.trackEvent("活跃", "active_foreground", "youXia", this.trueOrFalseYouXia());
      this.trackEvent("活跃", "active_foreground", "firstVisit", this.trueOrFalseFirstVisit());
    });

    // 后台活跃
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackEvent("活跃", "active_background", "youXia", this.trueOrFalseYouXia());
        this.trackEvent("活跃", "active_background", "firstVisit", this.trueOrFalseFirstVisit());
      }
    });
  }

  trackEvent(category, action, label, value) {
    window._czc.push(["_trackEvent", category, action, label, value]);
  }

  trackSignUpSuccess(status) {
    this.trackEvent("登录注册", "signUp_success", "status", status);
  }

  trackLoginSuccess(isYouXia) {
    this.trackEvent("登录注册", "login_success", "youXia", isYouXia);
  }

  trackSignUpFailure(errorCode) {
    this.trackEvent("登录注册", "signUp_failure", "errorCode", errorCode);
  }

  trackLoginFailure(errorCode) {
    this.trackEvent("登录注册", "login_failure", "errorCode", errorCode);
  }

  trackBoostStart(gameName) {
    this.trackEvent("加速", "boost_start", gameName);
  }

  trackBoostSuccess(gameName, region, node) {
    this.trackEvent("加速", "boost_success", gameName);
    this.trackEvent("加速", "boost_success", region);
    this.trackEvent("加速", "boost_success", node);
    // this.trackEvent("加速", "boost_success", "originalLatency", originalLatency);
    // this.trackEvent("加速", "boost_success", "optimizedLatency", optimizedLatency);
    // this.trackEvent("加速", "boost_success", "packetLoss", packetLoss);
  }
  // 完整版本加速成功
  // trackBoostSuccess(gameName: string, region: string, node: string, originalLatency: number, optimizedLatency: number, packetLoss: number) {
  //   this.trackEvent("加速", "boost_success", gameName);
  //   this.trackEvent("加速", "boost_success", region);
  //   this.trackEvent("加速", "boost_success", node);
  //   this.trackEvent("加速", "boost_success", "originalLatency", originalLatency);
  //   this.trackEvent("加速", "boost_success", "optimizedLatency", optimizedLatency);
  //   this.trackEvent("加速", "boost_success", "packetLoss", packetLoss);
  // }

  trackBoostFailure(errorCode) {
    this.trackEvent("加速", "boost_failure",errorCode);
  }

  trackBoostDisconnectManual(t) {
    this.trackEvent("加速", "boost_disconnect_manual",t);
  }

  trackBoostDisconnectPassive(reason) {
    this.trackEvent("加速", "boost_disconnect_passive", "reason", reason);
  }

  trackPurchasePageShow() {
    this.trackEvent("付费页", "purchase_page_show");
  }

  trackPurchaseStart(buyCount) {
    this.trackEvent("付费页", "purchase_start", "buyCount", buyCount);
  }

  trackPurchaseSuccess(buyCount) {
    this.trackEvent("付费页", "purchase_success", "buyCount", buyCount);
  }

  trackNetworkError(errorCode) {
    this.trackEvent("其他异常情况", "network_error", "errorCode", errorCode);
    // this.trackEvent("其他异常情况", "network_error", "retryCount", retryCount);
  }

  trueOrFalseYouXia() {
    // 根据具体逻辑返回 0是true 或 1是false
    return 0; // 或 false
  }

  trueOrFalseFirstVisit() {
    // 根据具体逻辑返回 0是true 或 1是false
    return 0; // 或 false
  }
}
  
export default new Tracking();
  