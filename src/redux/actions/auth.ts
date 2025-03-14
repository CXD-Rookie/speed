/*
 * @Author: zhangda
 * @Date: 2024-05-28 20:53:18
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-24 20:17:20
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\redux\actions\auth.ts
 */
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_IS_LOGIN = 'SET_IS_LOGIN';
export const OPEN_REAL_NAME_MODAL = 'OPEN_REAL_NAME_MODAL';
export const CLOSE_REAL_NAME_MODAL = 'CLOSE_REAL_NAME_MODAL';
export const OPEN_PAY_MODAL = 'OPEN_PAY_MODAL';
export const CLOSE_PAY_MODAL = 'CLOSE_PAY_MODAL';
export const UPDATE_DELAY = 'UPDATE_DELAY';
export const STOP_ACCELERATE = 'STOP_ACCELERATE';
export const ACCELERATE_TIME = 'ACCELERATE_TIME';
export const BIND_PHONE = 'BIND_PHONE';
export const SIGN_EXPIRES = 'SIGN_EXPIRES';
export const ACCELERATE_CHART = "ACCELERATE_CHART";
export const STARTPROGRESS = "STARTPROGRESS";
export const BOOSTTRACK = "BOOSTTRACK";

// 更新点击加速卡片来源
export const setBoostTrack = (boostTrack: any) => ({
  type: BOOSTTRACK,
  payload: boostTrack,
});

// 更新是否已经启动游戏状态
export const setStartProgress = (isStartProgress: any) => ({
  type: STARTPROGRESS,
  payload: isStartProgress,
});

// 更新加速详情图表数据
export const setAccelerateChart = (accelerateChart: any) => ({
  type: ACCELERATE_CHART,
  payload: accelerateChart,
});

// 标记提示加速服务并且没有实名认证的记号
export const signExpiresState = (sign_expires: any) => ({
  type: SIGN_EXPIRES,
  payload: sign_expires,
});

export const updateBindPhoneState = (isBindPhone: any) => ({
  type: BIND_PHONE,
  payload: isBindPhone,
});

export const updateAccelerateTime = (accelerateTime: any) => ({
  type: ACCELERATE_TIME,
  payload: accelerateTime,
});

export const loginSuccess = (token: string) => ({
  type: LOGIN_SUCCESS,
  payload: token,
});

export const logout = () => ({
  type: LOGOUT,
});

export const setIsLogin = (isLogin:any) => ({
  type: 'SET_IS_LOGIN',
  payload: isLogin,
});

export const openRealNameModal = () => ({
  type: OPEN_REAL_NAME_MODAL,
});

export const closeRealNameModal = () => ({
  type: CLOSE_REAL_NAME_MODAL,
});

export const openPayModal = () => ({
  type: OPEN_PAY_MODAL,
});

export const closePayModal = () => ({
  type: CLOSE_PAY_MODAL,
});

export const updateDelay = (delay: any) => ({
  type: UPDATE_DELAY,
  payload: delay,
});

export const stopAccelerate = (isStop: any) => ({
  type: STOP_ACCELERATE,
  payload: isStop,
});