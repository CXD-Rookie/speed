/*
 * @Author: zhangda
 * @Date: 2024-05-21 21:05:55
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-22 11:29:56
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\index.tsx
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";
import { setAccountInfo } from "@/redux/actions/account-info";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { store } from "@/redux/store";
import { setDrawVipActive, setFirstPayRP } from "@/redux/actions/modal-open";
import { setPayState, setMinorState } from "@/redux/actions/modal-open";

import tracking from "@/common/tracking";
import RealNameModal from "@/containers/real-name";
import Swiper from "../../containers/swiper/index";
import GameCard from "@/containers/came-card";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
import gamesBlackIcon from "@/assets/images/home/games_black.png";
import rechargeBlackIcon from "@/assets/images/home/recharge_black.png";
import emptyIcon from "@/assets/images/home/empty.svg";

import "./style.scss";
interface ImageItem {
  image_url: string;
  params: any;
}
const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { getGameList } = useGamesInitialize();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);

  const [images, setImages] = useState<ImageItem[]>([]);

  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [status, setStatus] = useState<number>(0); // 触发首页展示数据更新的状态
  const [homeList, setHomeList] = useState([]);
  const [accelTag, setAccelTag] = useState({});

  const dispatch: any = useDispatch();
  const isRealNamel = localStorage.getItem("isRealName");

  const openModal = async () => {
    const latestAccountInfo = store.getState().accountInfo;

    if (accountInfo?.isLogin) {
      if (isRealNamel === "1") {
        dispatch(openRealNameModal());
        return;
      } else if (!latestAccountInfo?.userInfo?.user_ext?.is_adult) {
        dispatch(setMinorState({ open: true, type: "recharge" })); // 关闭实名认证提示
        return;
      } else {
        tracking.trackPurchasePageShow("home");
        dispatch(setPayState({ open: true, couponValue: {} })); // 关闭会员充值页面
      }
    } else {
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  const handleShowModal = (type: any) => {
    if (accountInfo?.isLogin) {
      if (["2", "3"].includes(type)) {
        dispatch(setFirstPayRP({ open: true, type: Number(type) })); // 弹出首充首续
      }
    } else {
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  useEffect(() => {
    setHomeList(getGameList()?.slice(0, 4));
  }, [status, location]);

  useEffect(() => {
    if (location.state?.autoAccelerate && location.state?.data) {
      console.log("其他页面携带游戏进入首页");
      window.history.replaceState({}, document.title); // Remove state from history

      setStatus(status + 1);
      setAccelTag(location?.state?.data);
    }
  }, [location]);

  useEffect(() => {
    const fetchImages = () => {
      const storedImages = JSON.parse(localStorage.getItem("all_data") || "[]");
      
      setImages(storedImages);
      setIsImagesLoaded(true); // 数据加载完成
    };

    const timer = setTimeout(fetchImages, 300);
    return () => clearTimeout(timer);
  }, [accountInfo]);
  
  return (
    <div className="home-module">
      <GameCard
        options={homeList}
        locationType={"home"}
        customAccelerationData={accelTag}
        triggerDataUpdate={() => setStatus((status: number) => status + 1)}
      />
      {homeList?.length <= 0 && (
        <div className="empty-card">
          <img src={emptyIcon} alt="" />
          <div className="title">未发现本地游戏</div>
          <div className="text">去游戏库添加或者试试搜索游戏吧～</div>
          <Button
            className="to-games-check"
            type="primary"
            onClick={() => navigate("/gameLibrary")}
          >
            去游戏库看看
          </Button>
        </div>
      )}
      {isImagesLoaded && (
        <div className="functional-areas">
          {images?.length > 0 && (
            <div className="swiper">
              <Swiper onImageClick={handleShowModal} />
            </div>
          )}
          <div
            className={`membership-recharge ${
              images?.length > 0 ? "areas-list-box-auto" : "areas-list-box"
            }`}
            style={
              images?.length > 0
                ? {
                    height: "20vh",
                    width: "calc(50% - 0.8vw)",
                    color: "#683d11",
                    fontWeight: "bold",
                    backgroundImage:
                      "linear-gradient(to bottom right, #f8e7d6, #fdd9b3)",
                  }
                : {}
            }
            onClick={openModal}
          >
            <img
              src={images?.length > 0 ? rechargeBlackIcon : rechargeIcon}
              alt=""
            />
            会员充值
          </div>
          <div
            className={`may-games ${
              images?.length > 0 ? "areas-list-box-auto" : "areas-list-box"
            }`}
            onClick={() => navigate("/myGames")}
          >
            <img src={images?.length > 0 ? gamesBlackIcon : gamesIcon} alt="" />
            我的游戏 ({getGameList()?.length})
          </div>
        </div>
      )}
      {isRealOpen ? <RealNameModal /> : null}
    </div>
  );
};

export default Home;
