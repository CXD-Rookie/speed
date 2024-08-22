import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { LeftOutlined } from "@ant-design/icons";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setAccountInfo } from "@/redux/actions/account-info";

import "./style.scss";

import gameApi from "@/api/gamelist";
import IssueModal from "@/containers/IssueModal/index";
import addThemeIcon from "@/assets/images/common/add-theme.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import emptyIcon from "@/assets/images/home/empty.svg";

interface Game {
  id: string;
  name: string;
  name_en: string;
  cover_img: string;
  background_img: string;
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
  const dispatch: any = useDispatch();
  const historyContext: any = useHistoryContext();

  const { appendGameToList } = useGamesInitialize();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const searchBarValue = useSelector((state: any) => state.search.query);
  const searchResults = useSelector((state: any) => state.search.results);
  const enterSign = useSelector((state: any) => state.searchEnter);

  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [issueDescription, setIssueDescription] = useState<string | null>(null); // 添加状态控制 IssueModal 的默认描述

  const [oldSearchBarValue, setOldSearchBarValue] = useState();
  const [games, setGames] = useState<any>([]);

  const clickAddGame = (option: any) => {
    appendGameToList(option);
    navigate("/home");
  };

  const fetchGames = async () => {
    try {
      let res = await gameApi.gameList({
        params: {},
      });

      const gamesWithFullImgUrl = res.data.list.map((game: Game) => ({
        ...game,
        cover_img: `https://cdn.accessorx.com/${
          game.cover_img ? game.cover_img : game.background_img
        }`,
      }));
      setGames(gamesWithFullImgUrl);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const handleGoBack = () => {
    const currentPath = window.location.pathname;
    const history = historyContext?.history;

    const previousPath = history
      .slice(0, -1)
      .reverse()
      .find((path: any) => path !== currentPath);

    if (previousPath) {
      navigate(previousPath);
    } else {
      console.log("No previous path found.");
      navigate("/home");
    }
  };

  useEffect(() => {
    let result_game = [];

    if (searchResults.length === 0) {
      setGames([]); // 清空游戏列表
    } else {
      const gamesWithFullImgUrl = searchResults.map((game: Game) => ({
        ...game,
        cover_img: `${game.cover_img}`,
      }));

      result_game = gamesWithFullImgUrl;
      setGames(gamesWithFullImgUrl);
    }

    if (result_game?.length === 0) {
      setOldSearchBarValue(searchBarValue);
    }
  }, [enterSign]);

  return (
    <div className="game-list-module-container">
      <LeftOutlined className="back-button" onClick={handleGoBack} />
      <span className="num-search">共{games?.length}个搜索结果</span>
      {games.length > 0 ? (
        <div className="game-list">
          {games.map((game: any) => (
            <div key={game.id} className="game-card">
              <div className="content-box" onClick={() => clickAddGame(game)}>
                <img
                  className="back-icon"
                  src={game.cover_img}
                  alt={game.name}
                />
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
                <div className="game-name-en">{game.name_en}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-page">
          <div className="empty-content">
            <img src={emptyIcon} alt="" />
            <div className="empty-null-text">
              抱歉，没有找到“{oldSearchBarValue}”的相关游戏
            </div>
            <div
              className="empty-text"
              onClick={() => {
                if (store.getState().accountInfo?.isLogin) {
                  setShowIssueModal(true);
                  setIssueDescription(`未找到“${oldSearchBarValue}”的相关游戏`);
                } else {
                  dispatch(setAccountInfo(undefined, undefined, true));
                }
              }}
            >
              您可进行反馈，以便我们及时更新
            </div>
            <button
              className="browse-button"
              onClick={() => navigate("/gameLibrary")}
            >
              浏览其他游戏
            </button>
          </div>
        </div>
      )}
      {showIssueModal ? (
        <IssueModal
          showIssueModal={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          defaultInfo={issueDescription} // 传递默认描述
        />
      ) : null}
    </div>
  );
};

export default GameLibrary;
