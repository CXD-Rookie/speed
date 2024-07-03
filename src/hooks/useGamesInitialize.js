/*
 * @Author: zhangda
 * @Date: 2024-06-07 18:00:32
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-01 11:08:29
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\useGamesInitialize.js
 */
import { useHandleUserInfo } from "./useHandleUserInfo";

export const useGamesInitialize = () => {
  const { handleUserInfo } = useHandleUserInfo();

  const getGameList = () => {
    let local_games = localStorage.getItem("speed-1.0.0.1-games");
    let result_games = local_games ? JSON.parse(local_games) : [];

    return result_games;
  }

  // 查找是否有加速数据 返回数组 
  const identifyAccelerationData = (data = getGameList()) => {
    let find_result = [];

    if (data?.length > 0 && data instanceof Array) {
      for (let index = 0; index < data.length; index++) {
        if (data[index].is_accelerate) {
          find_result = [
            true, // 是否有加速数据
            data[index], // 加速数据
            index // 加速数据索引
          ]

          break;
        }
      }
    }

    return find_result;
  };

  // 游戏进行排序
  const sortGameList = (option = getGameList()) => {
    let arr = [...option];

    if (arr?.length > 0) {
      let accelerate_index = arr.findIndex((item) => item?.is_accelerate);

      if (accelerate_index !== -1) {
        let elementToMove = arr.splice(accelerate_index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

        // 将取出的元素插入到位置
        arr.splice(0, 0, elementToMove);
      }
    }

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));
    return arr;
  };

  // 清除我的游戏 all(全部) initialize(初始化) option{id:} 特定数据 id 必须包含
  const removeGameList = (option) => {
    let game_list = getGameList();

    if (option instanceof Object && option?.id && game_list?.length > 0) {
      let find_index = game_list.findIndex(item => item?.id === option?.id);

      game_list.splice(find_index, 1);
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));

      return game_list;
    }

    if (game_list?.length > 0 && option === "initialize") {
      game_list = game_list.map(item => ({
        ...item,
        is_accelerate: false
      }))

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));

      return game_list;
    }

    if (game_list?.length > 0 && option === "all") {
      game_list = game_list.map((item) => ({
        ...item,
        is_accelerate: false,
      }));

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));

      return game_list;
    }
  }

  // 添加游戏到我的游戏
  const appendGameToList = (option) => {
    let sort_list = [...sortGameList()]
    let find_index = sort_list.findIndex((item) => item?.id === option?.id);
    let is_accelerate = sort_list.some((item) => item?.is_accelerate);

    if (find_index !== -1) {
      if (find_index > 4) {
        sort_list.splice(is_accelerate ? 1 : 0, 0, option)
      }
    } else if (find_index === -1) {
      if (sort_list?.length < 4) {
        sort_list.push(option)
      } else {
        sort_list.splice(is_accelerate ? 1 : 0, 0, option)
      }
    }

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(sort_list));

    return sort_list;
  }

  // 加速我的游戏
  const accelerateGameToList = (option) => {
    let game_list = getGameList()

    if (game_list?.length > 0) {
      game_list = game_list.map(item => ({
        ...item,
        is_accelerate: option?.id === item?.id
      }))
    }

    let sort_list = sortGameList(game_list)

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(sort_list));

    return sort_list;
  }

  // 选择当前游戏默认选中节点 区服
  const chooseDefaultNode = (option = {}) => {
    let region = option?.select_region;
    let result_region = {}

    if (region?.length > 0 && region instanceof Array) {
      let find_index = region.findIndex(item => item?.is_select);
      result_region = region?.[find_index];
    }

    return result_region;
  }

  // 判断会员是否到期 true 到期
  const isExpire = (option) => {
    let vip_time = option?.userInfo?.vip_expiration_time
    let time = new Date().getTime() / 1000;

    if (time >= vip_time) {
      return true
    }

    return false
  }

  // 强制停止加速
  const forceStopAcceleration = async (option, customFun = () => { }) => {
    let is_expire = isExpire(option);

    if (is_expire) {
      let res = await handleUserInfo();
      let is_vip = res?.data?.user_info?.is_vip

      if (!is_vip) {
        customFun()
      }
    }
  }

  return {
    getGameList,
    appendGameToList,
    identifyAccelerationData,
    removeGameList,
    accelerateGameToList,
    chooseDefaultNode,
    forceStopAcceleration
  };
};