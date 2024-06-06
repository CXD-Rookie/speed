/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-28 21:24:29
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

import "./style.scss";
import GameCard from "../GameCard";

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<any>(0);
  const [gamesList, setGamesList] = useState([]);

  useEffect(() => {
    let arr = getMyGames();

    if (arr?.length > 0) {
      let details_arr_index = arr.findIndex((item: any) => item?.is_accelerate);
      let elementToMove = arr.splice(details_arr_index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

      // 将取出的元素插入到位置1
      arr.splice(0, 0, elementToMove);
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));
    }

    setGamesList(arr);
  }, [status]);

  return (
    <div className="my-games-module">
      <div className="back-box">
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="games">我的游戏 ({gamesList?.length})</div>
      </div>
      <div className="game-list">
        {gamesList?.length > 0 &&
          gamesList.map((game, index) => (
            <GameCard
              key={index}
              gameData={game}
              type={"my-game"}
              onClear={() => setStatus(status + 1)}
            />
          ))}
      </div>
    </div>
  );
};

export default MyGames;
