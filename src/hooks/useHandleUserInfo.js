/*
 * @Author: zhangda
 * @Date: 2024-06-07 15:06:47
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-08 15:48:38
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\useHandleUserInfo.js
 */
import { useDispatch } from 'react-redux';
import { setAccountInfo } from '@/redux/actions/account-info';

import loginApi from "@/api/login";

export const useHandleUserInfo = () => {
  const dispatch = useDispatch();

  const handleUserInfo = async () => {
    try {
      let res = await loginApi.userInfo();

      dispatch(setAccountInfo(res?.data?.user_info, undefined, undefined));
      localStorage.setItem("token", JSON.stringify(res?.data?.token));
    } catch (error) {
      console.log("useHandleUserInfo", error)
    }
  };

  return { handleUserInfo };
};