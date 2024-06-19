/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-19 14:55:25
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState, useRef } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import "./style.scss";
import GameCard from "../GameCard";

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<any>(0);
  const [gamesList, setGamesList] = useState([]);
  const [scrollCount, setScrollCount] = useState(0)
  useEffect(() => {
    setGamesList(getMyGames());
  }, [status]);


  useEffect(() => {
    const handleScroll = () => {
      const divElement = document.getElementById('myScrollableDiv');
      if (divElement) {
        const isAtTop = divElement.scrollTop === 0 && divElement.clientTop === 0;
        if (isAtTop) {
          console.log('滚动条已经滚动到顶部');
          setScrollCount((prevCount) => prevCount + 1);
        }
      }
    };

    const divElement = document.getElementById('myScrollableDiv');
    if (divElement) {
      divElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (divElement) {
        divElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []); 

  useEffect(() => {
    
    if (scrollCount>1) {
      setTimeout(() => {
        console.log('执行跳转到首页的逻辑');
        navigate('/home');
      }, 500);
    }
  }, [scrollCount]); 

  return (
    <div className="my-games-module">
      <div className="back-box">
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="games">我的游戏 ({gamesList?.length})</div>
      </div>
      <div id="myScrollableDiv" className="game-list">
        {gamesList?.length > 0 && (
          <GameCard
            options={gamesList}
            locationType={"my-game"}
            triggerDataUpdate={() => setStatus(status + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default MyGames;
