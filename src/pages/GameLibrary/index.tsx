import React, { useEffect, useState, useRef } from "react";

import "./style.scss";
import gameApi from "@/api/gamelist";
import GameCard from "@/containers/came-card";

interface Game {
  id: string;
  name: string;
  name_en: string;
  free_time: string;
  cover_img: string;
  background_img: string;
  note: string;
  screen_shot: string[];
  system_id: number[];
  platform: number[];
  download: {
    android: string;
  };
  playsuit: any;
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
  t: string;
}

const gamesTitle: GamesTitleProps[] = [
  {
    key: "1",
    label: "限时免费",
    t: "限时免费",
  },
  {
    key: "2",
    label: "热门游戏",
    t: "热门游戏",
  },
  {
    key: "3",
    label: "最新推荐",
    t: "最新推荐",
  },
  {
    key: "4",
    label: "国服游戏",
    t: "国服游戏",
  },
  {
    key: "5",
    label: "游戏平台",
    t: "游戏平台",
  },
];

const GameLibrary: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [gameActiveType, setGameActiveType] = useState<string>("");

  const gameListRef: any = useRef<HTMLDivElement>(null);

  // 根据分类进行本地数据过滤
  const filterGamesByCategory = async (
    category: string,
    gamesList: Game[] | null = null
  ) => {
    const cacheGame = localStorage.getItem("cacheGame");
    const cacheAllGame = JSON.parse(cacheGame || JSON.stringify({}));
    const allGames = gamesList || cacheAllGame?.allGame || [];
    const apiList: any = {
      限时免费: cacheAllGame?.freeGame,
      热门游戏: cacheAllGame?.hotGame,
      最新推荐: cacheAllGame?.newGame,
      国服游戏: cacheAllGame?.chinaGame,
    };
    
    // 根据tags过滤 如果是限时免费 free_time 字段必须存在
    if (apiList?.[category]) {
      setGames(apiList?.[category]);
    } else {
      const arr = allGames.filter((value: Game) =>
        value.tags.includes(category)
      );

      setGames(arr);
    }
  };

  // 点击分类时不再请求数据，而是本地过滤
  const handleTitleClick = (item: GamesTitleProps) => {
    gameListRef.current.scrollTop = 0;
    setGameActiveType(item.key);
    filterGamesByCategory(item.t);
  };

  useEffect(() => {
    setGameActiveType("1"); // 切换标签为 "限时免费"
    filterGamesByCategory("限时免费"); // 展示为 "限时免费" 的数据
    
    if ((window as any).cacheGameFun) {
      (window as any).cacheGameFun(); // 激活组件更新一下当前游戏的缓存
    }
  }, []);

  return (
    <div className="game-library-module-container">
      <div className="game-title-box">
        {gamesTitle.map((item) => (
          <div
            key={item?.key}
            className={`game-label ${
              gameActiveType === item?.key && "game-label-active"
            }`}
            onClick={() => handleTitleClick(item)}
          >
            {item?.label}
          </div>
        ))}
      </div>
      <GameCard
        options={games}
        locationType={"library"}
        bindRef={gameListRef}
      />
    </div>
  );
};

export default GameLibrary;
