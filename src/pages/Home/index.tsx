/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-22 15:05:24
 * @FilePath: \speed\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE;
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

import "./style.scss";
import GameCard from "./GameCard";

import addIcon from "@/assets/images/common/add.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  is_accelerate?: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [gameAccelerateList, setGameAccelerateList] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [homeList, setHomeList] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    let arr =
      localStorage.getItem("speed-1.0.0.1-accelerate") || JSON.stringify([]);
    let game_arr = localStorage.getItem("speed-1.0.0.1-accelerate")
      ? JSON.parse(arr)
      : [];

    setGameAccelerateList(game_arr);
  }, []);

  useEffect(() => {
    setHomeList(getMyGames());
  }, []);

  return (
    <div className="home-module">
      <div className="game-list">
        {homeList.map((game, index) => (
          <GameCard
            key={index}
            gameData={game}
            // isAccelerate={gameAccelerateList.includes(game?.id)}
            gameAccelerateList={gameAccelerateList}
            setGameAccelerateList={setGameAccelerateList}
          />
        ))}
        {homeList?.length < 4 &&
          Array.from(
            { length: 4 - homeList?.length },
            (_, index) => index + 1
          ).map((item) => (
            <div
              key={item}
              className="null-data-card"
              onClick={() => navigate("/gamelist")}
            >
              <img src={addIcon} width={100} height={100} alt="" />
              <div>加载更多游戏</div>
            </div>
          ))}
      </div>
      <div className="functional-areas">
        <div className="membership-recharge areas-list-box">
          <img
            onClick={openModal}
            src={rechargeIcon}
            width={100}
            height={100}
            alt=""
          />
          会员充值
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={closeModal}>
                  x
                </button>
                <iframe
                  src="https://jsq-cdn.yuwenlong.cn/web/pay.html"
                  width="100%"
                  height="400px"
                  title="Payment"
                ></iframe>
              </div>
            </div>
          )}
        </div>
        <div
          className="may-games areas-list-box"
          onClick={() => navigate("/myGames")}
        >
          <img src={gamesIcon} width={100} height={100} alt="" />
          我的游戏 (9)
        </div>
      </div>
    </div>
  );
};

export default Home;
