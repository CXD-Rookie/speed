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