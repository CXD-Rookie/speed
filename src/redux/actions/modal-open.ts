export const START_PATH = 'START_PATH'; // 启动路径开关
export const CURRENCY_EXCHANGE = 'CURRENCY_EXCHANGE' // 口令兑换开关
export const SETTING = 'SETTING' // 设置开关 
export const FEEDBACKPOPUP = 'FEEDBACKPOPUP' // 问题反馈
export const NEWUSER = 'NEWUSER' // 新用户弹窗

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