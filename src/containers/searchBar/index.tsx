/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-22 14:34:24
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-29 17:00:45
 * @FilePath: \speed\src\containers\searchBar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { fetchSearchResults } from "../../redux/actions/search";
import { getMyGames } from "@/common/utils";

import "./index.scss";

type RootState = {
  search: {
    query: string;
    results: { id: string; name: string; name_en: string }[];
  };
};

const SearchBar: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();
  const query = useSelector((state: RootState) => state.search.query);
  const results = useSelector((state: RootState) => state.search.results) || [];
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;

    dispatch(fetchSearchResults(searchQuery));
    setShowDropdown(!!searchQuery);
  };

  const handleSearchResultClick = (option: any) => {
    console.log("触发游戏添加--------------");
    // 获取当前的我的游戏列表
    let myGames = getMyGames();

    // 检查是否已经包含了当前选中的游戏
    const isAlreadyAdded = myGames.some((game: any) => game.id === option.id);

    // 如果游戏没有被添加过，将其添加到我的游戏列表的开头
    if (!isAlreadyAdded) {
      myGames.unshift(option);

      // 更新本地存储
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(myGames));
    }

    // 跳转到首页并触发自动加速autoAccelerate
    navigate("/home", {
      state: { isNav: true, data: option, autoAccelerate: true },
    });
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate("/gamelist"); // 在输入框按下回车键时跳转到搜索结果页面
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="搜索游戏"
        value={query}
        onChange={handleSearch}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onKeyDown={handleEnterKeyPress}
      />
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((result, index) => (
            <div
              key={index}
              className="search-item"
              onClick={() => handleSearchResultClick(result)}
            >
              {result.name} ({result.name_en})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
