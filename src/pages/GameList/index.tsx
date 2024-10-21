import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setAccountInfo } from "@/redux/actions/account-info";
import { nodeDebounce } from "@/common/utils";

import "./style.scss";
import gameApi from "@/api/gamelist";

import IssueModal from "@/containers/IssueModal/index";
import addThemeIcon from "@/assets/images/common/add-theme.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import emptyIcon from "@/assets/images/home/empty.svg";
import fanhuiIcon from "@/assets/images/common/fanhui.svg";

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
  const location = useLocation();
  const dispatch: any = useDispatch();
  const historyContext: any = useHistoryContext();

  const { appendGameToList } = useGamesInitialize();
  const searchBarValue = useSelector((state: any) => state.search.query);
  const searchResults = useSelector((state: any) => state.search.results);
  const enterSign = useSelector((state: any) => state.searchEnter);

  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [issueDescription, setIssueDescription] = useState<string | null>(null); // 添加状态控制 IssueModal 的默认描述

  const [oldSearchBarValue, setOldSearchBarValue] = useState();
  const [games, setGames] = useState<any>([]);
  const [enterQuery, setEnterQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pagesize,] = useState(30);
  const [total, setTotal] = useState(0);

  const clickAddGame = (option: Game) => {
    appendGameToList(option);
    navigate("/home");
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
      navigate("/home");
    }
  };

  // 请求游戏列表
  const fetchGameList = async (page: number = 1) => {
    try {
      const res = await gameApi.gameList({ page, pagesize, s: enterQuery || searchBarValue });
      const data = (res?.data?.list || []).map((game: Game) => ({
        ...game,
        cover_img: `https://cdn.accessorx.com/${
          game.cover_img || game.background_img
        }`,
      }));

      setEnterQuery(searchBarValue);
      setPage(page)
      setTotal(res?.data?.total || 0);
      setGames(page > 1 ? [...games, ...data] : data);
    } catch (error) {
      console.log(error);
    }
  };

  // 表格滚动
  function handleScroll(e: any) {
    if (e.target.getAttribute("class") === "game-list") {
      let scrollTop = e.target.scrollTop;
      let clientHeight = e.target.clientHeight;
      let scrollHeight = e.target.scrollHeight;
      
      if (
        Math.ceil(scrollTop) + Math.ceil(clientHeight) + 1 >= scrollHeight &&
        total > games?.length
      ) {
        fetchGameList(page + 1)
      }
    }
  }

  useEffect(() => {
    let result_game: Game[] = [];

    if (searchResults.length === 0) {
      setPage(1);
      setTotal(0);
      setGames([]); // 清空游戏列表
    } else {
      fetchGameList();
    }

    if (result_game?.length === 0) {
      setOldSearchBarValue(searchBarValue);
    }
  }, [location.key, enterSign]);

  return (
    <div className="game-list-module-container" key={location.key}>
      <div className="back-button-box">
        <img
          src={fanhuiIcon}
          alt=""
          className="back-button"
          onClick={handleGoBack}
        />
        <span className="num-search">共{total}个搜索结果</span>
      </div>
      {games.length > 0 ? (
        <div className="game-list" onScroll={nodeDebounce(handleScroll, 200)}>
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
                <div className="game-name-en">
                  {game.note ? game.note : `${game.name_en}`}
                </div>
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
