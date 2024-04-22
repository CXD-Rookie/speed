/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-22 14:41:02
 * @FilePath: \speed\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { useNavigate } from "react-router-dom";

import "./style.scss";
import GameCard from "./GameCard";

import addIcon from "@/assets/images/common/add.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  is_accelerate?: boolean;
}

const games: Game[] = [
  {
    id: 1,
    name: "原神",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["二次元", "开放世界", "RPG"],
    is_accelerate: true,
  },
  {
    id: 2,
    name: "英雄联盟",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "策略"],
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-module">
      <div className="game-list">
        {games.map((game) => (
          <GameCard key={game?.id} gameData={game} />
        ))}
        {games?.length < 4 &&
          Array.from(
            { length: 4 - games?.length },
            (_, index) => index + 1
          ).map((item) => (
            <div
              key={item}
              className="null-data-card"
              onClick={() => navigate("/gamelist")}
            >
              <img src={addIcon} width={120} height={120} alt="" />
              <div>加载更多游戏</div>
            </div>
          ))}
      </div>
      <div className="functional-areas">
        <div className="membership-recharge areas-list-box">
          <img src={rechargeIcon} width={120} height={120} alt="" />
          会员充值
        </div>
        <div
          className="may-games areas-list-box"
          onClick={() => navigate("/myGames")}
        >
          <img src={gamesIcon} width={120} height={120} alt="" />
          我的游戏 (9)
        </div>
      </div>
    </div>
  );
};

export default Home;
