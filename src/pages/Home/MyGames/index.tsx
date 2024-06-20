/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-20 17:56:12
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
    // 初始监听滚轮事件的处理函数
    const handleWheel = (event: WheelEvent) => {
console.log(scrollCount)
      if (event.deltaY < 0) {
        console.log('初始滚轮向上滑动');
        // 执行你想要的操作，例如跳转到首页
        navigate('/home');
      }
    };

    // 监听 myScrollableDiv 的滚动事件处理函数
    const handleScroll = () => {
      console.log("开始滚动")
      window.removeEventListener('wheel', handleWheel); // 移除初始滚轮事件监听器
      const divElement = document.getElementById('myScrollableDiv');
      if (divElement) {
        const isAtTop = divElement.scrollTop === 0 && divElement.clientTop === 0;
        if (isAtTop) {
          window.addEventListener('wheel', handleWheel); // 移除初始滚轮事件监听器
          setScrollCount((prevCount) => prevCount + 1);
        }
      }
    };

    // 添加初始滚轮事件监听器
    window.addEventListener('wheel', handleWheel);

    // 添加 myScrollableDiv 的滚动事件监听器和窗口大小改变事件监听器
    const divElement = document.getElementById('myScrollableDiv');
    if (divElement) {
      divElement.addEventListener('scroll', handleScroll);
    }

    // 返回清理函数，移除所有监听器
    return () => {
      window.removeEventListener('wheel', handleWheel); // 移除初始滚轮事件监听器
      if (divElement) {
        divElement.removeEventListener('scroll', handleScroll); // 移除 myScrollableDiv 的滚动事件监听器
      }
    };
  }, []); 

  useEffect(() => {
    console.log(scrollCount,"scrollCount-------------")
    if (scrollCount>0) {
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
