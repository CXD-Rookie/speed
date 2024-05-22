// src/components/SearchBar/SearchBar.tsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { fetchSearchResults } from '../../redux/actions/search';
import './index.scss';

type RootState = {
  search: {
    query: string;
    results: { id: string; name: string; name_en: string }[];
  };
};

const SearchBar: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const query = useSelector((state: RootState) => state.search.query);
  const results = useSelector((state: RootState) => state.search.results) || []; // 确保 results 为数组
  const [showDropdown, setShowDropdown] = useState(false);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    dispatch(fetchSearchResults(searchQuery));
    setShowDropdown(!!searchQuery);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="搜索游戏"
        value={query}
        onChange={handleSearch}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // 延时关闭下拉菜单，确保点击
      />
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((result, index) => (
            <div key={index} className="search-item">
              {result.name} ({result.name_en})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
