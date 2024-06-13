import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// 创建上下文
const HistoryContext = createContext([]);

// 创建提供者组件
export const HistoryProvider = ({ children }) => {
  const location = useLocation();

  const [history, setHistory] = useState([]);

  const [count, setCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
        accelerateTime: { count, stopTimer, startTimer }
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
