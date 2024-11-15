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
  const [gameActiveType, setGameActiveType] = useState<string>("1");

  const gameListRef: any = useRef<HTMLDivElement>(null);

  // 初始化时请求数据并缓存到 localStorage
  const fetchAndCacheGames = async () => {
    try {
      // { page: 1, pagesize: 5000 }
      const res = await gameApi.gameList(); // 获取全部游戏数据
      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: game.cover_img ? `https://cdn.accessorx.com/${game.cover_img}` : `https://cdn.accessorx.com/${game.background_img}`,
      }));
      
      // 缓存到 localStorage
      localStorage.setItem("cachedGames", JSON.stringify(gamesWithFullImgUrl));
      
      // 初次渲染显示 "限时免费" 分类
      filterGamesByCategory("限时免费", gamesWithFullImgUrl);
      
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  // 根据分类进行本地数据过滤
  const filterGamesByCategory = (category: string, gamesList: Game[] | null = null) => {
    const allGames =
      gamesList || JSON.parse(localStorage.getItem("cachedGames") || "[]");
    let filteredGames = [];

    // 根据tags过滤 如果是限时免费 free_time 字段必须存在
    if (category === "限时免费") {
      filteredGames = allGames.filter(
        (game: Game) => game.tags.includes(category) && game?.free_time
      );
    } else {
      filteredGames = allGames.filter((game: Game) =>
        game.tags.includes(category)
      );
    }

    setGames(filteredGames);
  };

  // 点击分类时不再请求数据，而是本地过滤
  const handleTitleClick = (item: GamesTitleProps) => {
    gameListRef.current.scrollTop = 0
    setGameActiveType(item.key);
    filterGamesByCategory(item.t);
  };

  useEffect(() => {
    // 每次激活组件时重新请求数据并更新缓存
    fetchAndCacheGames();
    // 强制切换回 "限时免费" 标签并设置选中状态
    const freeTitle = gamesTitle.find(title => title.t === "限时免费");
    if (freeTitle) {
      setGameActiveType(freeTitle.key);
    }
    
    filterGamesByCategory("限时免费");
  }, [])

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
