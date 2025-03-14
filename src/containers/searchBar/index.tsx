/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-22 14:34:24
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-23 18:47:56
 * @FilePath: \speed\src\containers\searchBar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { setEnterSign } from "@/redux/actions/search-enter";
import { fetchSearchResults } from "@/redux/actions/search";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";
import eventBus from "@/api/eventBus";
import HotBar from "./hot-bar";

import rightArrowIcon from "@/assets/images/common/right-search-arrow.svg";
import searchIcon from "@/assets/images/common/search.svg";

type RootState = {
  search: {
    query: string;
    results: { id: string; name: string; name_en: string, note?: string }[];
  };
};

const SearchBar: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();

  const { appendGameToList } = useGamesInitialize();
  const [placeholder, setPlaceholder] = useState('搜索游戏');
  
  const enterSign = useSelector((state: any) => state.searchEnter);
  const { query, results, isSearchLoading }: any = useSelector(
    (state: RootState) => state.search
  );
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const [hotOpen, setHotOpen] = useState(false); // 热门游戏开关

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;

    setShowDropdown(searchQuery.trim().length > 0);

    if (searchQuery?.length === 0) {
      setHotOpen(true);
    } else {
      setHotOpen(false);
    }

    if (searchQuery?.length <= 50) {
      dispatch(fetchSearchResults(searchQuery, undefined, 1, 30));
    }
  };

  const handleSearchResultClick = (option: any) => {
    const data = appendGameToList(option);
    const optionParams = data.filter((item: any) => item?.id === option?.id)?.[0] || {};
    
    // 跳转到首页并触发自动加速autoAccelerate
    navigate("/home", {
      state: {
        isNav: true,
        data: {
          ...optionParams,
          router: "search",
          track: "searchBar" // 埋点点击加速来源标记
        },
        autoAccelerate: true,
      },
    });
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query?.length > 0 && !isSearchLoading) {
      e.currentTarget.blur(); // 失去焦点
      setShowDropdown(false);
      dispatch(setEnterSign(enterSign));
      navigate("/gameList"); // 在输入框按下回车键时跳转到搜索结果页面
    }
  };

  return (
    <div className="search-bar">
      <div className="search-box">
        <div className="icon-box">
          <img src={searchIcon} alt=""></img>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleSearch}
          onFocus={() => {
            setPlaceholder("");

            if (query.trim().length > 0) {
              setShowDropdown(true);
            } else {
              setHotOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
            setTimeout(() => setHotOpen(false), 200);
            setPlaceholder("搜索游戏");
          }}
          onKeyDown={handleEnterKeyPress}
        />
      </div>
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown-box">
          <div className="search-dropdown">
            {results.slice(0, 4).map((result: any, index: number) => (
              <div
                key={index}
                className="search-item"
                onClick={async (e) => {
                  e.stopPropagation();
                  setIsClicking(true);

                  if (localStorage.getItem("isAccelLoading") !== "1") {
                    if (!isClicking) {
                      handleSearchResultClick(result);
                    }
                  } else {
                    eventBus.emit("showModal", {
                      show: true,
                      type: "gamesAccelerating",
                    });
                  }

                  setIsClicking(false);
                }}
              >
                <div className="name-box">
                  <div className="search-result-name ellipsis">
                    {result.name}
                  </div>
                  <div className="name-note ellipsis">
                    {result?.note || result?.name_en}
                  </div>
                </div>
                <div className="acc-text">加速</div>
              </div>
            ))}
          </div>
          <div className="line" />
          <div className="check-more" onClick={() => navigate("/gameList")}>
            查看更多 <img src={rightArrowIcon} alt="" />
          </div>
        </div>
      )}
      {hotOpen && (
        <HotBar
          open={hotOpen}
          setIsClicking={setIsClicking}
          isClicking={isClicking}
          handleSearchResultClick={handleSearchResultClick}
        />
      )}
    </div>
  );
};

export default SearchBar;
