import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 导入 useHistory
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
  const navigate = useNavigate(); // 获取 history 对象
  const query = useSelector((state: RootState) => state.search.query);
  const results = useSelector((state: RootState) => state.search.results) || [];
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    dispatch(fetchSearchResults(searchQuery));
    setShowDropdown(!!searchQuery);
  };

  const handleSearchResultClick = (option: any) => {
    let arr = getMyGames();
    let result = getMyGames();

    arr?.forEach((item: any, index: number) => {
      if (item?.id === option?.id && index > 4) {
        // 从位置4取出元素
        let elementToMove = result.splice(index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

        // 将取出的元素插入到位置1
        result.splice(0, 0, elementToMove); // 在位置0插入元素
      } else if (item?.id !== option?.id) {
        result.splice(0, 0, option); // 在位置0插入元素
      }
    });

    navigate("/home", { state: { isNav: true, data: option } }); // 点击搜索结果后跳转到搜索结果页面
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
        onKeyDown={handleEnterKeyPress} // 监听键盘事件
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
