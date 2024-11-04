/*
 * @Author: zhangda
 * @Date: 2024-06-07 18:00:32
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-10 19:36:03
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\useGamesInitialize.js
 */
import { useHandleUserInfo } from "./useHandleUserInfo";
import gameApi from "@/api/gamelist";
import eventBus from "@/api/eventBus";

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
        // sort_list.splice(is_accelerate ? 1 : 0, 0, option)
        let temp = sort_list[find_index];
        // 将第二个索引处的值移动到第一个索引处
        sort_list[find_index] = sort_list[is_accelerate ? 1 : 0];
        // 将临时存储的值移动到第二个索引处
        sort_list[is_accelerate ? 1 : 0] = temp;
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
  const accelerateGameToList = (option, params = {}) => {
    let game_list = getGameList()

    if (game_list?.length > 0) {
      game_list = game_list.map(item => ({
        ...item,
        is_accelerate: option?.id === item?.id,
        ...params
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

  const checkGameisFree = async (option) => {
    try {
      const res = await gameApi.gameList({ s: option?.name });
      const data = res?.data?.list || []
      const result = data.filter(item => item?.id === option?.id)?.[0] || { ...option }
      const return_result = {
        ...option,
        tags: result?.tags,
        free_time: result?.free_time
      };
      let game_list = getGameList();

      game_list = game_list.map(item => {
        if (item?.id === option?.id) {
          const data = { ...return_result }

          // 存储游戏去除游戏用来判断是否手动的字段，只做单次判断
          if (data?.isNode) {
            delete data.isNode;
          }
          
          if (data?.isAuto) {
            delete data.isAuto;
          }

          return data
        }

        return item
      })

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));

      return return_result
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }
  
  // 调用游戏列表接口，通过中文名称，查询是否有返回值作为当前游戏是否下架的依据
  const checkShelves = async (option, customFun) => {
    try {
      const res = await gameApi.gameList({ s: option?.name });
      const data = res?.data?.list;
      
      if ((res?.error === 0 && !data) || data?.[0]?.id !== option?.id) {
        if (customFun) {
          customFun?.onTrigger();
        }

        eventBus.emit("showModal", {
          show: true,
          type: "takenShelves",
          value: option,
          onOk: customFun?.onTrigger,
        });

        return { state: true }
      } else if (
        data?.[0]?.id === option?.id 
        && data?.[0].update_time !== option?.update_time
      ) {
        const meGame = getGameList(); // 我的游戏
        const index = meGame.findIndex(item => item?.id === data?.[0]?.id);
        const obj = {
          ...option,
          ...data?.[0],
          cover_img:
            `https://cdn.accessorx.com/${data?.[0]?.cover_img ?? data?.[0].background_img}`
        }

        meGame[index] = obj;
        localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(meGame));
        
        return {
          state: false,
          data: obj,
        }
      }

      return { state: false }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    getGameList,
    appendGameToList,
    identifyAccelerationData,
    removeGameList,
    accelerateGameToList,
    chooseDefaultNode,
    forceStopAcceleration,
    checkGameisFree,
    checkShelves
  };
};