/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-07 19:34:30
 * @FilePath: \speed\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE;
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";
import { setAccountInfo } from "@/redux/actions/account-info";
import { useHandleUserInfo } from "@/common/useHandleUserInfo";
import { useGamesInitialize } from "@/common/useGamesInitialize";

import MinorModal from "@/containers/minor";
import RealNameModal from "@/containers/real-name";
import PayModal from "../../containers/Pay/index";
import GameCardCopy from "./GameCard copy";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
import emptyIcon from "@/assets/images/home/empty.svg";

import "./style.scss";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { handleUserInfo } = useHandleUserInfo();
  const { sortGameList } = useGamesInitialize();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);

  const [status, setStatus] = useState<any>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [homeList, setHomeList] = useState([]);
  const [accelTag, setAccelTag] = useState({});

  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const dispatch: any = useDispatch();
  const isRealNamel = localStorage.getItem("isRealName");

  const openModal = () => {
    handleUserInfo();

    if (accountInfo?.isLogin) {
      if (isRealNamel === "1") {
        dispatch(openRealNameModal());
        return;
      } else if (!accountInfo?.userInfo?.user_ext?.is_adult) {
        setIsMinorOpen(true);
        setMinorType("recharge");
        return;
      } else {
        setIsModalOpen(true);
      }
    } else {
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  useEffect(() => {
    setHomeList(sortGameList()?.slice(0, 4));
  }, [status]);

  useEffect(() => {
    console.log("查看updata是否更新");
    if (location.state?.autoAccelerate && location.state?.data) {
      setAccelTag(location?.state?.data);

      window.history.replaceState({}, document.title); // Remove state from history

      sortGameList()?.slice(0, 4);
      setAccelTag(location?.state?.data);
    }
  }, [location]);

  return (
    <div className="home-module">
      <GameCardCopy options={homeList} locationType={"home"} />
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
          我的游戏 ({sortGameList()?.length})
        </div>
      </div>
      {!!isModalOpen && (
        <PayModal
          isModalOpen={isModalOpen}
          setIsModalOpen={(e) => setIsModalOpen(e)}
        />
      )}
      {isRealOpen ? <RealNameModal /> : null}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
    </div>
  );
};

export default Home;
