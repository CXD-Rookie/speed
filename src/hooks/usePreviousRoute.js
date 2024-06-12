import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// 创建上下文
const HistoryContext = createContext([]);

// 创建提供者组件
export const HistoryProvider = ({ children }) => {
  const location = useLocation();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory((prevHistory) => [...prevHistory, location.pathname]);
  }, [location.pathname]);

  return (
    <HistoryContext.Provider value={history}>
      {children}
    </HistoryContext.Provider>
  );
};

// 创建一个自定义 Hook 来使用上下文
export const useHistoryContext = () => {
  return useContext(HistoryContext);
};
