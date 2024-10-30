export const START_PATH = 'START_PATH'; // 启动路径开关
export const CURRENCY_EXCHANGE = 'CURRENCY_EXCHANGE' // 口令兑换开关

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