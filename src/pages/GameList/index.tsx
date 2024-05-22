// src/pages/GameLibrary.tsx
import React, { useEffect, useState } from "react";
import gameApi from "@/api/gamelist";

import "./style.scss";

interface Game {
  id: string;
  name: string;
  name_en: string;
  cover_img: string;
  note: string;
  screen_shot: string[];
  system_id: number[];
  platform: number[];
  download: {
    android: string;
  };
  game: any;
  site: string;
  tags: string[];
  game_more: {
    news: string;
    guide: string;
    store: string;
    bbs: string;
    mod: string;
    modifier: string;
  };
  create_time: number;
  update_time: number;
}

interface GamesTitleProps {
  label: string;
  key: string;
}

const gamesTitle: GamesTitleProps[] = [
  {
    key: "1",
    label: "热门游戏",
  },
  {
    key: "2",
    label: "近期推荐",
  },
  {
    key: "3",
    label: "休闲娱乐",
  },
  {
    key: "4",
    label: "游戏平台",
  },
];

const GameLibrary: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      let res = await gameApi.gameList({
        params: {
          s: "",
          t: "",
          page: 1,
          pagesize: 10,
        },
      });
      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://jsq-cdn.yuwenlong.cn/${game.cover_img}`,
      }));
      setGames(gamesWithFullImgUrl);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  return (
    <div className="game-library">
      <div className="game-title-box">
        {gamesTitle.map((item) => (
          <div
            key={item?.key}
            // className={`game-label ${
            //   gameActiveType === item?.key && "game-label-active"
            // }`}
            // onClick={() => setGameActiveType(item?.key)}
          >
            {item?.label}
          </div>
        ))}
      </div>
      <div className="game-list">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.cover_img} alt={game.name} />
            <h2>{game.name}</h2>
            <p>{game.name_en}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLibrary;
