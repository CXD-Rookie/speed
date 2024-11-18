export const START_PATH = 'START_PATH'; // 启动路径开关
export const CURRENCY_EXCHANGE = 'CURRENCY_EXCHANGE' // 口令兑换开关
export const SETTING = 'SETTING' // 设置开关 
export const FEEDBACKPOPUP = 'FEEDBACKPOPUP' // 问题反馈
export const NEWUSER = 'NEWUSER' // 新用户弹窗
export const APPCLOSE = 'APPCLOSE' // app关闭窗口设置提醒
export const DRAWVIPACTIVE = 'DRAWVIPACTIVE' // 领取会员有效期弹窗
export const FIRSTPAYRP = 'FIRSTPAYRP' // 首次购买，续费弹窗
export const PAY = 'PAY' // 支付弹窗
export const MINORTYPE = 'MINORTYPE' // 三方登录 实名认证等UI确定弹窗
export const BINDPHONE = 'BINDPHONE' // 第三方手机绑定类型弹窗
export const UPDATE_VERSION = 'UPDATE_VERSION' // 发现新版本弹窗

// 发现新版本弹窗
export const setVersionState = (open: any) => ({
  type: UPDATE_VERSION,
  payload: open,
});

// 第三方手机绑定类型弹窗
export const setBindState = (open: any) => ({
  type: BINDPHONE,
  payload: open,
});

// 三方登录 实名认证等UI确定弹窗
export const setMinorState = (open: any) => ({
  type: MINORTYPE,
  payload: open,
});

// 支付弹窗
export const setPayState = (open: any) => ({
  type: PAY,
  payload: open,
});

// 首次购买，续费弹窗
export const setFirstPayRP = (open: any) => ({
  type: FIRSTPAYRP,
  payload: open,
});

// 领取会员有效期弹窗
export const setDrawVipActive = (open: any) => ({
  type: DRAWVIPACTIVE,
  payload: open,
});

// app关闭窗口设置提醒
export const setAppCloseOpen = (open: any) => ({
  type: APPCLOSE,
  payload: open,
});

// 新用户弹窗
export const setNewUserOpen = (open: any) => ({
  type: NEWUSER,
  payload: open,
});

// 问题反馈
export const setFeedbackPopup = (open: any) => ({
  type: FEEDBACKPOPUP,
  payload: open,
});

// 更新启动路径open
export const setStartPathOpen = (open: any) => ({
  type: START_PATH,
  payload: open,
});

// 更新口令兑换open
export const setCurrencyOpen = (open: any) => ({
  type: CURRENCY_EXCHANGE,
  payload: open,
});

// 设置开关
export const setSetting = (open: any) => ({
  type: SETTING,
  payload: open,
});