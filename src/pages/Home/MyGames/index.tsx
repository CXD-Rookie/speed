/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-24 19:24:02
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import "./style.scss";
import GameCard from "../GameCard";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  is_accelerate?: boolean;
}

const games: Game[] = [
  {
    id: 10,
    name: "原神",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["二次元", "开放世界", "RPG"],
    is_accelerate: true,
  },
  {
    id: 12,
    name: "英雄联盟",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "策略"],
  },
  {
    id: 3,
    name: "绝地求生",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["FPS", "射击", "生存"],
  },
  {
    id: 4,
    name: "我的世界",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["沙盒", "建造", "冒险"],
  },
  {
    id: 5,
    name: "王者荣耀",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "手游"],
  },
  {
    id: 6,
    name: "Apex英雄",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["FPS", "射击", "Battle Royale"],
  },
  {
    id: 7,
    name: "糖豆人：终极淘汰赛",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["休闲", "多人", "竞技"],
  },
];

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [gameAccelerateList, setGameAccelerateList] = useState<any>([]);

  useEffect(() => {
    let arr =
      localStorage.getItem("speed-1.0.0.1-accelerate") || JSON.stringify([]);
    let game_arr = localStorage.getItem("speed-1.0.0.1-accelerate")
      ? JSON.parse(arr)
      : [];

    setGameAccelerateList(game_arr);
  }, []);

  return (
    <div className="my-games-module">
      <div className="back-box">
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="games">我的游戏 (9)</div>
      </div>
      <div className="game-list">
        {games.map((game) => (
          <GameCard
            key={game?.id}
            gameData={game}
            type={"my-game"}
            isAccelerate={gameAccelerateList.includes(game.id)}
            gameAccelerateList={gameAccelerateList}
            setGameAccelerateList={setGameAccelerateList}
          />
        ))}
      </div>
    </div>
  );
};

export default MyGames;
