export const START_PATH = 'START_PATH'; // 启动路径开关

// 更新启动路径open
export const setStartPathOpen = (open: any) => ({
  type: START_PATH,
  payload: open,
});