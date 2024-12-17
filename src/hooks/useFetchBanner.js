import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNewUserOpen } from '@/redux/actions/modal-open';
import activePayApi from "@/api/activePay";

/**
 * 自定义hook用于获取banner图数据
 */
const useFetchBanner = () => {
  const dispatch = useDispatch();

  const [allData, setAllData] = useState([]);
  const [isPayActive, setIsPayActive] = useState(false);

  const avtiveDay = async () => {
    const images = JSON.parse(localStorage.getItem("all_data") || "[]");
    const lastPopupTime = localStorage.getItem("lastPopupTime");

    // 当前时间
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // 当天的23:59:59

    if (!lastPopupTime && images?.length > 0) {
      // 如果从未展示过弹窗，则直接展示
      setTimeout(() => {
        dispatch(setNewUserOpen(true)); // 新用户弹出
        // 标记弹窗已展示，记录当前时间
        localStorage.setItem("lastPopupTime", now.toISOString());
      }, 2000);
    } else {
      const lastPopupDate = new Date(lastPopupTime);

      // 如果上次弹窗展示时间早于当天的23:59:59，则再次展示
      if (lastPopupDate < endOfDay && now >= endOfDay) {
        setTimeout(() => {
          dispatch(setNewUserOpen(true)); // 新用户弹出
          // 更新弹窗展示时间，记录新的时间
          localStorage.setItem("lastPopupTime", now.toISOString());
        }, 2000);
      }
    }
  };

  const fetchAndStoreBannerData = async () => {
    try {
      const res = (await activePayApi.getBanner())?.data || {}; // 调用api读取数据
      const {
        first_purchase = {}, // 首充充值
        first_renewal = {}, // 首充续费
        new_user = {}, // 新用户
        join_qq = {} // 加入qq群链接
      } = res;

      const integrFun = (key, data, allData) => {
        if (data && data.length > 0) {
          localStorage.setItem(key, JSON.stringify(data));
          return [...allData, ...data];
        } else {
          localStorage.removeItem(key);
          return allData;
        }
      };

      let updatedData = []; // 存储 banner 数据

      updatedData = integrFun("join_qq", join_qq, updatedData); // 加入qq群链接
      updatedData = integrFun("new_user", new_user, updatedData); // 更新 newUser
      updatedData = integrFun("first_purchase", first_purchase, updatedData); // 更新 first_purchase
      updatedData = integrFun("first_renewal", first_renewal, updatedData); // 更新 first_renewal

      setAllData(updatedData);
      localStorage.setItem("all_data", JSON.stringify(updatedData));

      if (updatedData.length > 0 && !isPayActive) {
        avtiveDay(); // 这里假设avtiveDay()是一个有效的函数
        localStorage.setItem("isPayActive", "true");
        setIsPayActive(true);
      }
    } catch (error) {
      console.error('Failed to fetch banner data:', error);
    }
  };

  useEffect(() => {
    // fetchAndStoreBannerData();
  }, []); // 注意这里的依赖数组，确保每次isPayActive改变时不重新执行

  
  return {
    allData,
    isPayActive,
    fetchBanner: fetchAndStoreBannerData,
  };
};

export default useFetchBanner;