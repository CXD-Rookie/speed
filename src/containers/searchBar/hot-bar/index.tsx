/*
 * @Author: zhangda
 * @Date: 2024-12-30 17:30:03
 * @LastEditors: zhangda
 * @LastEditTime: 2024-12-30 17:30:22
 * @Description: 游戏卡片组件
 */
import React, { useEffect, useState } from "react";

import "./index.scss";
import eventBus from "@/api/eventBus";
import fireIcon from "@/assets/images/common/fire.png";

interface GameCardProps {
  open: boolean;
  setIsClicking?: (bool: boolean) => void;
  isClicking?: boolean;
  handleSearchResultClick?: (bool: any) => void;
}

const HotBar: React.FC<GameCardProps> = (props) => {
  const {
    open,
    isClicking,
    setIsClicking = () => {},
    handleSearchResultClick = () => {},
  } = props;

  const [hotGame, setHotGame] = useState([]);

  useEffect(() => {
    if (open) {
      const cacheGame = localStorage.getItem("cacheGame");
      const cacheAllGame = JSON.parse(cacheGame || JSON.stringify({}));
      const hotGame = cacheAllGame?.hotGame || [];

      setHotGame(hotGame);
    }  
  }, [open]);

  return (
    <div className="hot-bar">
      <div className="fire-box">
        <img src={fireIcon} alt="" />
        <span>热门游戏</span>
      </div>
      {hotGame.slice(0, 4).map((result: any, index) => (
        <div
          key={index}
          className="search-item"
          onClick={(e) => {
            e.stopPropagation();
            setIsClicking(true);
            
            if (localStorage.getItem("isAccelLoading") !== "1") {
              console.log(111);
              
              if (!isClicking) {
                console.log(222);
                
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
            <div className="search-result-name ellipsis">{result.name}</div>
            <div className="name-note ellipsis">
              {result?.note || result?.name_en}
            </div>
          </div>
          <div className="acc-text">加速</div>
        </div>
      ))}
    </div>
  );
};

export default HotBar;
