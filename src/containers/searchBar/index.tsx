/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-22 14:34:24
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-11 18:05:30
 * @FilePath: \speed\src\containers\searchBar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { fetchSearchResults } from "../../redux/actions/search";
import { setEnterSign } from "@/redux/actions/search-enter";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";

import rightArrowIcon from "@/assets/images/common/right-search-arrow.svg";
import searchIcon from "@/assets/images/common/search.svg";

type RootState = {
  search: {
    query: string;
    results: { id: string; name: string; name_en: string }[];
  };
};

const SearchBar: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();

  const { appendGameToList } = useGamesInitialize();

  const enterSign = useSelector((state: any) => state.searchEnter);
  const query = useSelector((state: RootState) => state.search.query);
  const results = useSelector((state: RootState) => state.search.results) || [];

  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;

    if (searchQuery?.length <= 50) {
      setShowDropdown(!!searchQuery);
      dispatch(fetchSearchResults(searchQuery));
    }
  };

  const handleSearchResultClick = (option: any) => {
    appendGameToList(option);
    // 跳转到首页并触发自动加速autoAccelerate
    navigate("/home", {
      state: { isNav: true, data: option, autoAccelerate: true },
    });
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query?.length > 0) {
      dispatch(setEnterSign(enterSign));
      navigate("/gamelist"); // 在输入框按下回车键时跳转到搜索结果页面
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
          placeholder="搜索游戏"
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleEnterKeyPress}
        />
      </div>
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown-box">
          <div className="search-dropdown">
            {results.map((result, index) => (
              <div
                key={index}
                className="search-item"
                onClick={() => handleSearchResultClick(result)}
              >
                <div>{result.name}</div>
                <img src={rightArrowIcon} alt="" />
              </div>
            ))}
          </div>
          <div className="line" />
          <div className="check-more" onClick={() => navigate("/gameList")}>
            查看更多 <img src={rightArrowIcon} alt="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
