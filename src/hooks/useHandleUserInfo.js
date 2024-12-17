/*
 * @Author: zhangda
 * @Date: 2024-06-07 15:06:47
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-11 18:46:45
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\useHandleUserInfo.js
 */
import { useDispatch } from 'react-redux';
import { setAccountInfo } from '@/redux/actions/account-info';
import { validateRequiredParams } from '@/common/utils';

import webSocketService from "@/common/webSocketService";
import loginApi from "@/api/login";

export const useHandleUserInfo = () => {
  const dispatch = useDispatch();

  const handleUserInfo = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }
      
      let res = await loginApi.userInfo();

      dispatch(setAccountInfo(res?.data?.user_info, undefined, undefined));
      localStorage.setItem("token", JSON.stringify(res?.data?.token));
      localStorage.setItem("is_new_user", JSON.stringify(res.data.is_new_user));
      localStorage.setItem("vip_experience_time", JSON.stringify(res.data.vip_experience_time));
      webSocketService.loginReconnect();
      return res
    } catch (error) {
      console.log("useHandleUserInfo", error)
    }
  };

  return { handleUserInfo };
};