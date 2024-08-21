import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./style.scss";

import gameApi from "@/api/gamelist";

import addThemeIcon from "@/assets/images/common/add-theme.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import {useActivate, useUnactivate} from "react-activation";
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
  const navigate = useNavigate();
  const { appendGameToList } = useGamesInitialize();

  const [games, setGames] = useState<Game[]>([]);
  const [gameActiveType, setGameActiveType] = useState<string>("1");
  const [t, setT] = useState<string | null>("限时免费"); // 默认选中限时免费

  const gameListRef = useRef<HTMLDivElement>(null);

  // 初始化时请求数据并缓存到 localStorage
  const fetchAndCacheGames = async () => {
    try {
      const res = await gameApi.gameList({ page: 1, pagesize: 6000 }); // 获取全部游戏数据
      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: game.cover_img ? `https://cdn.accessorx.com/${game.background_img}` : `https://cdn.accessorx.com/${game.background_img}`,
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
    const allGames = gamesList || JSON.parse(localStorage.getItem("cachedGames") || "[]");
    
    // 根据tags过滤
    const filteredGames = allGames.filter((game: Game) => game.tags.includes(category));
    
    setGames(filteredGames);
  };

  const clickAddGame = (option: any) => {
    appendGameToList(option);
    navigate("/home");
  };

  // 点击分类时不再请求数据，而是本地过滤
  const handleTitleClick = (item: GamesTitleProps) => {
    setGameActiveType(item.key);
    setT(item.t);
    filterGamesByCategory(item.t);
  };

  useActivate(() => {
    console.log("组件已激活");
    // 每次激活组件时重新请求数据并更新缓存
  fetchAndCacheGames();
  });

  useUnactivate(() => {
    console.log("组件已缓存");
  });

  useEffect(() => {
    // 首次加载时请求数据并缓存
    if (!localStorage.getItem("cachedGames")) {
      fetchAndCacheGames();
    } else {
      filterGamesByCategory(t || "限时免费");
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
      <div className="game-list" ref={gameListRef}>
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <div className="content-box" onClick={() => clickAddGame(game)}>
              {game?.tags.includes("限时免费") && game?.free_time && (
                <div className="exemption-box">
                  <div className="exemption">限免</div>
                  {game?.free_time !== "永久" && (
                    <div className="time">剩余 {game?.free_time}</div>
                  )}
                </div>
              )}
              <img className="back-icon" src={game.cover_img} alt={game.name} />
              <div className="game-card-content">
                <img className="add-icon" src={addThemeIcon} alt="" />
                <img
                  className="game-card-active-icon"
                  src={acceleratedIcon}
                  alt=""
                />
              </div>
            </div>
            <div className="card-text-box">
              <div className="game-name">{game.name}</div>
              <div className="game-name-en">
                {game.note ? game.note : `${game.name_en}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLibrary;
