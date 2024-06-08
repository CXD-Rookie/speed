/*
 * @Author: zhangda
 * @Date: 2024-06-07 18:00:32
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-07 18:25:48
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\common\useGamesInitialize.js
 */
export const useGamesInitialize = () => {
  const getGameList = () => {
    let local_games = localStorage.getItem("speed-1.0.0.1-games");
    let result_games = local_games ? JSON.parse(local_games) : [];

    return result_games;
  }

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

  const updateGameList = (game) => {
    let default_arr = getGameList();
    let default_index = default_arr.findIndex(
      (item) => item?.id === game?.id
    );

    if (default_index !== -1) {
      // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素
      let elementToMove = default_arr.splice(default_index, 1)[0];

      if (default_index > 3) {
        default_arr.splice(0, 0, elementToMove);
      } else if (default_index >= 0 && default_index <= 3) {
        default_arr.splice(default_index, 0, elementToMove);
      }

      localStorage.setItem(
        "speed-1.0.0.1-games",
        JSON.stringify(default_arr)
      );
    }
  };

  return { sortGameList };
};