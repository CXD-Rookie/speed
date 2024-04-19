/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-19 16:49:20
 * @FilePath: \speed\src\pages\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./style.scss";

import addIcon from "@/assets/images/common/add.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
}

const games: Game[] = [
  {
    id: 1,
    name: "原神",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["二次元", "开放世界", "RPG"],
  },
  {
    id: 2,
    name: "英雄联盟",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "策略"],
  },
];

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleMouseEnter = (gameId: number) => {
    setHoveredCard(gameId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null); // 隐藏所有浮动层
  };

  const handleAccelerateClick = () => {
    // 处理立即加速按钮的点击事件
    console.log("立即加速");
    navigate("/gameDetail");
  };

  return (
    <div className="my-games-module">
      <div className="back-box">
        <div className="back" onClick={() => navigate("/home")}>
          返回
        </div>
        <div className="games">我的游戏 (9)</div>
      </div>
      <div className="game-list">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onMouseEnter={() => handleMouseEnter(game.id)}
            onMouseLeave={handleMouseLeave} // 修改这里
          >
            <img src={game.image} alt={game.name} />
            <div className="card-text-box">
              <h3>{game.name}</h3>
            </div>
            <button
              className="accelerate-button"
              style={{ display: hoveredCard === game.id ? "block" : "none" }}
              onClick={handleAccelerateClick}
            >
              立即加速
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyGames;
