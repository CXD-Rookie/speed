import { useState } from 'react';
import activePayApi from "@/api/activePay";

/**
 * 自定义hook用于获取banner图数据
 */
const useFetchBanner = () => {
  const [allData, setAllData] = useState([]);

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
    } catch (error) {
      console.error('Failed to fetch banner data:', error);
    }
  };

  return {
    allData,
    fetchBanner: fetchAndStoreBannerData,
  };
};

export default useFetchBanner;