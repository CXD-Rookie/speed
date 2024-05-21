// src/pages/GameLibrary.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import gameApi from "@/api/gamelist";
import "./style.scss";
import { useNavigate } from "react-router-dom";
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
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    fetchGames();
  }, [page, pageSize, search, tag]);

  const fetchGames = async () => {
    try {
      let res = await gameApi.gameList({
        params: {
          s: search,
          t: tag,
          page: page,
          pagesize: pageSize,
        },
      });
      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://jsq-cdn.yuwenlong.cn/${game.cover_img}`,
      }));
      setGames(gamesWithFullImgUrl);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  return (
    <div className="game-library">
    <header className="header">
      <h1>游戏库</h1>
      <input
        type="text"
        placeholder="搜索游戏"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </header>
    <div className="game-list">
      {games.map((game) => (
        <div key={game.id} className="game-card">
          <img src={game.cover_img} alt={game.name} />
          <h2>{game.name}</h2>
          <p>{game.name_en}</p>
        </div>
      ))}
    </div>
    <footer className="footer">
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>上一页</button>
      <button onClick={() => setPage(page + 1)}>下一页</button>
    </footer>
  </div>
  );
};

export default GameLibrary;
