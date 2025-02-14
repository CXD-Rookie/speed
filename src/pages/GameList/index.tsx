import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setAccountInfo } from "@/redux/actions/account-info";
import { nodeDebounce } from "@/common/utils";
import { setFeedbackPopup } from "@/redux/actions/modal-open";

import "./style.scss";
import GameCard from "@/containers/came-card";
import gameApi from "@/api/gamelist";

import emptyIcon from "@/assets/images/home/empty.svg";
import fanhuiIcon from "@/assets/images/common/fanhui.svg";
import loadingGif from "@/assets/images/common/jiazai.gif";

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

  const searchBarValue = useSelector((state: any) => state.search.query);
  const searchResults = useSelector((state: any) => state.search.results);
  const enterSign = useSelector((state: any) => state.searchEnter);

  const [oldSearchBarValue, setOldSearchBarValue] = useState();
  const [games, setGames] = useState<any>([]);
  const [enterQuery, setEnterQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pagesize,] = useState(30);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(false); // 是否搜索中

  const handleGoBack = () => {
    const currentPath = window.location.pathname;
    const history = historyContext?.history;
    const previousPath = history
      .slice(0, -1)
      .reverse()
      .find((path: any) => path !== currentPath);
    
    // 处理在游戏详情中到结果页点击返回的情况 
    if (previousPath && previousPath !== "/gameDetail") {
      navigate(previousPath);
    } else {
      navigate("/home");
    }
  };

  // 请求游戏列表 query = {page,s}
  const fetchGameList = async (query: any) => {
    try {
      if (query?.page <= 1) {
        setIsLoading(true);
      }

      const res = await gameApi.gameList({
        ...query,
        pagesize,
      });
      const data = (res?.data?.list || []).map((game: Game) => ({
        ...game,
        cover_img: `${process.env.REACT_APP_SHEER_API_URL}${
          game.cover_img || game.background_img
        }`,
      }));

      setPage(query?.page);
      setTotal(res?.data?.total || 0);
      setGames(query?.page > 1 ? [...games, ...data] : data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false)
    }
  };
  
  // 表格滚动
  function handleScroll(e: any) {
    if (
      e.target.getAttribute("class") ===
      "game-card-module result-game-card-module"
    ) {
      let scrollTop = e.target.scrollTop;
      let clientHeight = e.target.clientHeight;
      let scrollHeight = e.target.scrollHeight;

      if (
        Math.ceil(scrollTop) + Math.ceil(clientHeight) + 1 >= scrollHeight &&
        total > games?.length
      ) {
        fetchGameList({ page: page + 1, s: enterQuery });
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
      setEnterQuery(searchBarValue);
      fetchGameList({page: 1, s: searchBarValue});
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
      {isLoading ? (
        <img style={{ margin: "38vh 43.8vw" }} src={loadingGif} alt="" />
      ) : (
        <>
          {games?.length > 0 ? (
            <GameCard
              options={games}
              locationType={"result"}
              onScroll={nodeDebounce(handleScroll, 200)}
            />
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
                      dispatch(
                        setFeedbackPopup({
                          open: true,
                          defaultInfo: `未找到“${oldSearchBarValue}”的相关游戏`,
                        })
                      );
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
        </>
      )}
    </div>
  );
};

export default GameLibrary;
