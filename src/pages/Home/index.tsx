/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-28 20:48:05
 * @FilePath: \speed\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE;
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import { Button } from "antd";
import PayModal from "../../containers/Pay/index";
import "./style.scss";
import GameCard from "./GameCard";
import addIcon from "@/assets/images/common/add.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
import emptyIcon from "@/assets/images/home/empty.svg";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<any>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [homeList, setHomeList] = useState([]);
  const [myGamesNum, setMyGamesNum] = useState(0);

  const [accelTag, setAccelTag] = useState({});

  const pid = localStorage.getItem("pid");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateData = () => {
    let arr = getMyGames();

    setMyGamesNum(arr?.length);
    setHomeList(arr?.slice(0, 4));
  };

  useEffect(() => {
    updateData();
  }, [status]);

  useEffect(() => {
    console.log(location);
    // if (location?.state?.type) {
    //   window.history.replaceState({}, "");
    //   updateData();
    //   setAccelTag(location?.state?.data);
    // }
  }, [location]);

  return (
    <div className="home-module">
      <div className="game-list">
        {homeList.map((game, index) => (
          <GameCard
            key={index}
            gameData={game}
            accelTag={accelTag}
            onClear={() => setStatus(status + 1)}
          />
        ))}
        {homeList?.length < 4 &&
          homeList?.length > 0 &&
          Array.from(
            { length: 4 - homeList?.length },
            (_, index) => index + 1
          ).map((item) => (
            <div
              key={item}
              className="null-data-card"
              onClick={() => navigate("/gameLibrary")}
            >
              <div className="null-content-card">
                <img src={addIcon} alt="" />
                <div>加载更多游戏</div>
              </div>
            </div>
          ))}
        {homeList?.length <= 0 && (
          <div className="empty-card">
            <img src={emptyIcon} alt="" />
            <div className="title">未发现本地游戏</div>
            <div className="text">去游戏库添加或者试试搜索游戏吧～</div>
            <Button type="primary" onClick={() => navigate("/gameLibrary")}>
              去游戏库看看
            </Button>
          </div>
        )}
      </div>
      <div className="functional-areas">
        <div className="membership-recharge areas-list-box">
          <img onClick={openModal} src={rechargeIcon} alt="" />
          会员充值
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={closeModal}>
                  x
                </button>
                <PayModal />
              </div>
            </div>
          )}
        </div>
        <div
          className="may-games areas-list-box"
          onClick={() => navigate("/myGames")}
        >
          <img src={gamesIcon} alt="" />
          我的游戏 ({myGamesNum})
        </div>
      </div>
    </div>
  );
};

export default Home;
