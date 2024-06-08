/*
 * @Author: zhangda
 * @Date: 2024-06-07 18:00:32
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-08 17:25:50
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\hooks\useGamesInitialize.js
 */
export const useGamesInitialize = () => {
  const getGameList = () => {
    let local_games = localStorage.getItem("speed-1.0.0.1-games");
    let result_games = local_games ? JSON.parse(local_games) : [];

    return result_games;
  }

  // 查找是否有加速数据 返回数组 
  const identifyAccelerationData = (data) => {
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

  const sortGameList = () => {
    let arr = getGameList();

    if (arr?.length > 0) {
      let accelerate_index = arr.findIndex((item) => item?.is_accelerate);
      let elementToMove = arr.splice(accelerate_index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

      // 将取出的元素插入到位置
      arr.splice(0, 0, elementToMove);
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
  }

  return { getGameList, sortGameList, identifyAccelerationData, removeGameList };
};