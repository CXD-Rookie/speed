/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-22 16:19:53
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

import "./style.scss";
import GameCard from "../GameCard";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  is_accelerate?: boolean;
}

const games: Game[] = [];

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [gameAccelerateList, setGameAccelerateList] = useState<any>([]);
  const [gamesList, setGamesList] = useState([]);

  useEffect(() => {
    let arr =
      localStorage.getItem("speed-1.0.0.1-accelerate") || JSON.stringify([]);
    let game_arr = localStorage.getItem("speed-1.0.0.1-accelerate")
      ? JSON.parse(arr)
      : [];

    setGameAccelerateList(game_arr);
  }, []);

  useEffect(() => {
    setGamesList(getMyGames());
  }, []);

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
              gameAccelerateList={gameAccelerateList}
              setGameAccelerateList={setGameAccelerateList}
            />
          ))}
      </div>
    </div>
  );
};

export default MyGames;
