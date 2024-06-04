import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyGames } from "@/common/utils";

import "./style.scss";
import gameApi from "@/api/gamelist";
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

const GameLibrary: React.FC = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);

  const searchBarValue = useSelector((state: any) => state.search.query);
  const searchResults = useSelector((state: any) => state.search.results);

  const clickAddGame = (option: any) => {
    let arr = getMyGames();
    let is_true =
      arr.filter((item: any) => item?.id === option?.id)?.length > 0;

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

  const fetchGames = async () => {
    try {
      let res = await gameApi.gameList({
        params: {},
      });

      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://cdn.accessorx.com/${game.cover_img}`,
      }));
      setGames(gamesWithFullImgUrl);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  useEffect(() => {
    if (searchResults.length === 0) {
      setGames([]); // 清空游戏列表
    } else {
      const gamesWithFullImgUrl = searchResults.map((game: Game) => ({
        ...game,
        cover_img: `${game.cover_img}`,
      }));
      setGames(gamesWithFullImgUrl);
    }
  }, [searchResults]);

  return (
    <div className="game-list-module-container">
      {games.length > 0 ? (
        <div className="game-list">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="content-box">
                <img
                  className="back-icon"
                  src={game.cover_img}
                  alt={game.name}
                />
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
      ) : (
        <div className="empty-page">
          <div className="empty-page-content">
            抱歉，没有找到"{searchBarValue}"的相关游戏
          </div>
          <div className="button-container">
            {/* <button className="back-button" onClick={() => navigate(-1)}>
              返回
            </button> */}
            <button className="browse-button" onClick={() => fetchGames()}>
              浏览其他游戏
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLibrary;
