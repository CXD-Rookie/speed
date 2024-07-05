import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./style.scss";

import gameApi from "@/api/gamelist";

import addThemeIcon from "@/assets/images/common/add-theme.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";

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
    label: "热门游戏",
    t: "热门游戏",
  },
  {
    key: "2",
    label: "最新推荐",
    t: "最新推荐",
  },
  {
    key: "3",
    label: "吃鸡竞技",
    t: "吃鸡竞技",
  },
  {
    key: "4",
    label: "游戏平台",
    t: "游戏平台",
  },
];

const GameLibrary: React.FC = () => {
  const navigate = useNavigate();

  const { appendGameToList } = useGamesInitialize();

  const [games, setGames] = useState<Game[]>([]);
  const [gameActiveType, setGameActiveType] = useState<string>("1");
  const [page, setPage] = useState<number>(1);
  const [t, setT] = useState<string | null>("热门游戏"); // 默认选中热门游戏

  const isFetching = useRef<boolean>(false);
  const hasMore = useRef<boolean>(true);
  const gameListRef = useRef<HTMLDivElement>(null);

  const clickAddGame = (option: any) => {
    appendGameToList(option);
    navigate("/home");
  };

  const fetchGames = async (pageNum: number, tParam: string | null) => {
    if (isFetching.current || !hasMore.current) return;
    isFetching.current = true;

    try {
      const param: any = {
        page: pageNum,
        pagesize: 600,
      };
      if (tParam) {
        param.t = tParam;
      }
      const res = await gameApi.gameList(param);

      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://cdn.accessorx.com/${
          game.cover_img ? game.cover_img : game.background_img
        }`,
      }));

      if (res.data.list.length < 600) {
        hasMore.current = false;
      }
      setGames((prevGames) => [...prevGames, ...gamesWithFullImgUrl]);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      isFetching.current = false;
    }
  };
// 分页逻辑注释掉
  // useEffect(() => {
  //   fetchGames(page, t);
  //   const handleScroll = () => {
  //     if (gameListRef.current) {
  //       const { scrollTop, scrollHeight, clientHeight } = gameListRef.current;
  //       if (
  //         clientHeight + scrollTop >= scrollHeight - 200 &&
  //         !isFetching.current
  //       ) {
  //         setPage((prevPage) => prevPage + 1);
  //       }
  //     }
  //   };

  //   const gameListElement = gameListRef.current;
  //   if (gameListElement) {
  //     gameListElement.addEventListener("scroll", handleScroll);
  //     return () => {
  //       gameListElement.removeEventListener("scroll", handleScroll);
  //     };
  //   }
  // }, []);

  // useEffect(() => {
  //   if (page > 1) {
  //     fetchGames(page, t);
  //   }
  // }, [page]);

  useEffect(() => {
    if (t !== null) {
      setPage(1);
      setGames([]);
      hasMore.current = true;
      fetchGames(1, t);
    }
  }, [t]);

  const handleTitleClick = (item: GamesTitleProps) => {
    setGameActiveType(item.key);
    setT(item.t);
  };

  useEffect(() => {
    // 在组件加载时，默认选中热门游戏并请求数据
    setT("热门游戏");
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
              {game?.free_time && (
                <div className="exemption-box">
                  <div className="exemption">限免</div>
                  {game?.free_time !== "永久" && (
                    <div className="time">剩余{game?.free_time}</div>
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
              {/* <div className="game-name-en">{game.name_en}</div> */}
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
