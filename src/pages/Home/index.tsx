/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 17:56:09
 * @FilePath: \speed\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE;
 */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsLogin, openRealNameModal } from "@/redux/actions/auth";
import PayModal from "../../containers/Pay/index";
import GameCard from "./GameCard";
import addIcon from "@/assets/images/common/add.svg";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
import emptyIcon from "@/assets/images/home/empty.svg";

import "./style.scss";

interface Game {
  id: string;
  name: string;
  cover_img: string;
  is_accelerate?: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const [status, setStatus] = useState<any>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [homeList, setHomeList] = useState([]);
  const [myGamesNum, setMyGamesNum] = useState(0);
  const [accelTag, setAccelTag] = useState({});
  const [autoAccelerateGame, setAutoAccelerateGame] = useState<Game | null>(
    null
  );

  const childRef = useRef<any>();
  const isRealNamel = localStorage.getItem("isRealName");
  const dispatch = useDispatch();

  const handleOpen = () => {
    dispatch(openRealNameModal());
  };

  const openModal = () => {
    if (accountInfo?.isLogin) {
      if (isRealNamel === "1") {
        handleOpen();
      } else {
        setIsModalOpen(true);
      }
    } else {
      dispatch(setIsLogin(true));
    }
  };

  const updateData = () => {
    let arr = getMyGames();

    console.log("查看mygame是否更新-------------------------");
    setMyGamesNum(arr?.length);
    setHomeList(arr?.slice(0, 4));
  };

  useEffect(() => {
    updateData();
  }, [status]);

  useEffect(() => {
    if (location.state?.autoAccelerate && location.state?.data) {
      console.log("查看updata是否更新");
      setAutoAccelerateGame(location.state.data as Game);
      window.history.replaceState({}, document.title); // Remove state from history
      updateData();
      setAccelTag(location?.state?.data);
    }
  }, [location]);

  useEffect(() => {
    console.log(
      `看看游戏的id------------------------------------------------`,
      autoAccelerateGame
    );
    if (autoAccelerateGame) {
      handleAccelerateClick(autoAccelerateGame);
    }
  }, [autoAccelerateGame]);

  const handleAccelerateClick = (game: Game) => {
    // 查找对应的游戏卡片并触发其加速逻辑
    console.log("查看game----------", game);
    if (game) {
      // 将自动加速的游戏数据添加到 homeList 中
      //@ts-ignore
      let default_arr = getMyGames();
      let default_index = default_arr.findIndex(
        (item: any) => item?.id === game?.id
      );

      if (default_index !== -1) {
        // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素
        let elementToMove = default_arr.splice(default_index, 1)[0];

        if (default_index > 3) {
          default_arr.splice(0, 0, elementToMove);
        } else if (default_index >= 0 && default_index <= 3) {
          default_arr.splice(default_index, 0, elementToMove);
        }

        localStorage.setItem(
          "speed-1.0.0.1-games",
          JSON.stringify(default_arr)
        );
        setHomeList(default_arr.slice(0, 4));
        updateData();

        // @ts-ignore
        // 触发对应游戏卡片的加速逻辑
        // document.getElementById(`${game.id}`)?.click();
        if (childRef.current) {
          console.log("homeList----------", homeList);
          setAccelTag(location?.state?.data);
          // childRef.current.triggerAccelerate(location?.state?.data);
        }
      }
    }
  };

  return (
    <div className="home-module">
      <div className="game-list">
        {homeList.map((game, index) => (
          <GameCard
            key={index}
            ref={childRef}
            gameData={game}
            accelTag={accelTag}
            setAccelTag={() => setAccelTag({})}
            onClear={() => setStatus(status + 1)}
            //@ts-ignore
            id={`${game.id}`}
          />
        ))}
        {homeList?.length < 4 && homeList?.length > 0 && (
          <div
            className="null-data-card"
            onClick={() => navigate("/gameLibrary")}
          >
            <div className="null-content-card">
              <img src={addIcon} alt="" />
              <div>添加更多游戏</div>
            </div>
          </div>
        )}
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
        <div className="membership-recharge areas-list-box" onClick={openModal}>
          <img src={rechargeIcon} alt="" />
          会员充值
        </div>
        <div
          className="may-games areas-list-box"
          onClick={() => navigate("/myGames")}
        >
          <img src={gamesIcon} alt="" />
          我的游戏 ({myGamesNum})
        </div>
      </div>
      {!!isModalOpen && (
        <PayModal
          isModalOpen={isModalOpen}
          setIsModalOpen={(e) => setIsModalOpen(e)}
        />
      )}
    </div>
  );
};

export default Home;
