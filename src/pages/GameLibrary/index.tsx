import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyGames } from "@/common/utils";
import gameApi from "@/api/gamelist";
import "./style.scss";
import addThemeIcon from "@/assets/images/common/add-theme.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";

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
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [gameActiveType, setGameActiveType] = useState<string>("1");
  const [page, setPage] = useState<number>(1);
  const isFetching = useRef<boolean>(false); // 使用 ref 变量防止重复请求
  const hasMore = useRef<boolean>(true); // 用于追踪是否还有更多数据
  const searchBarValue = useSelector((state: any) => state.search.query);
  const searchResults = useSelector((state: any) => state.search.results);
  const gameListRef = useRef<HTMLDivElement>(null);

  const clickAddGame = (option: any) => {
    let arr = getMyGames();
    let is_true = arr.filter((item: any) => item?.id === option?.id)?.length > 0;

    if (!is_true) {
      if (arr?.length >= 4) {
        arr = [option, ...arr];
      } else {
        arr.push(option);
      }
    }

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));
    navigate("/home");
  };

  const fetchGames = async (pageNum: number) => {
    if (isFetching.current || !hasMore.current) return; // 如果正在加载或没有更多数据则返回
    isFetching.current = true;
    try {
      const param = {
        page: pageNum,
        pagesize: 10,
      };
      const res = await gameApi.gameList(param);
      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://jsq-cdn.yuwenlong.cn/${game.cover_img}`,
      }));
      if (res.data.list.length < 10) {
        hasMore.current = false; // 如果获取到的数据少于请求的数量，说明没有更多数据了
      }
      setGames(prevGames => [...prevGames, ...gamesWithFullImgUrl]);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchGames(page); // 在组件加载时调用一次，用于初始化

    const handleScroll = () => {
      if (gameListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = gameListRef.current;
        if (clientHeight + scrollTop >= scrollHeight - 200 && !isFetching.current) {
          setPage(prevPage => prevPage + 1); // 更新 page
        }
      }
    };

    const gameListElement = gameListRef.current;
    if (gameListElement) {
      gameListElement.addEventListener('scroll', handleScroll);
      return () => {
        gameListElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchGames(page); // 当 page 更新时调用
    }
  }, [page]);

  return (
    <div className="game-list-module-container">
      <div className="game-title-box">
        {gamesTitle.map((item) => (
          <div
            key={item?.key}
            className={`game-label ${gameActiveType === item?.key && "game-label-active"}`}
            onClick={() => setGameActiveType(item?.key)}
          >
            {item?.label}
          </div>
        ))}
      </div>
      <div className="game-list" ref={gameListRef}>
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <div className="content-box">
              <img className="back-icon" src={game.cover_img} alt={game.name} />
              <div className="game-card-content">
                <img
                  className="add-icon"
                  src={addThemeIcon}
                  alt=""
                  onClick={() => clickAddGame(game)}
                />
                <img
                  className="game-card-active-icon"
                  src={acceleratedIcon}
                  alt=""
                />
              </div>
            </div>
            <div className="card-text-box">
              <div className="game-name">{game.name}</div>
              <div className="game-name-en">{game.name_en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLibrary;
