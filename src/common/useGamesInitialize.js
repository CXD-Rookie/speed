/*
 * @Author: zhangda
 * @Date: 2024-06-07 18:00:32
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-07 18:06:02
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\common\useGamesInitialize.js
 */
import { useDispatch } from 'react-redux';
import { setAccountInfo } from '@/redux/actions/account-info';

import loginApi from "@/api/login";

export const useGamesInitialize = () => {
  const getGameList = () => {
    let local_games = localStorage.getItem("speed-1.0.0.1-games");
    let result_games = local_games ? JSON.parse(local_games) : [];

    return result_games;
  }

  const sortGameList = () => {

  };

  return {};
};