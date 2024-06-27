/*
 * @Author: zhangda
 * @Date: 2024-06-12 10:43:26
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-27 17:18:02
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\usePreviousRoute.js
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// 创建上下文
const HistoryContext = createContext([]);

// 创建提供者组件
export const HistoryProvider = ({ children }) => {
  const location = useLocation();

  const [history, setHistory] = useState([]); // 路由历史

  const [count, setCount] = useState(0); // 详情每秒计时
  const [isTimerRunning, setIsTimerRunning] = useState(false); // 是否停止计时器

  const [isNetworkError, setIsNetworkError] = useState(false); // 是否出现网络错误，断网

  let interval;

  // 加速时长计时器
  useEffect(() => {
    if (isTimerRunning) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      interval = setInterval(() => {
        setCount(prevCount => prevCount + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning]);

  // 加速时长计时器 停止
  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    setCount(0)
  }, [])

  // 加速时长计时器 开始
  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, [])

  useEffect(() => {
    setHistory((prevHistory) => [...prevHistory, location.pathname]);
  }, [location.pathname]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        accelerateTime: { count, stopTimer, startTimer },
        isNetworkError,
        setIsNetworkError
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

// 创建一个自定义 Hook 来使用上下文
export const useHistoryContext = () => {
  return useContext(HistoryContext);
};
