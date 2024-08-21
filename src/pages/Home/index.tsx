/*
 * @Author: zhangda
 * @Date: 2024-05-21 21:05:55
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-21 14:37:54
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\index.tsx
 */
import React, { useEffect, useState,useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";
import { setAccountInfo } from "@/redux/actions/account-info";
// import { setFirstAuth,setImages } from "@/redux/actions/firstAuth";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { store } from "@/redux/store";

import activePayApi from "@/api/activePay";
import MinorModal from "@/containers/minor";
import RealNameModal from "@/containers/real-name";
import PayModal from "../../containers/Pay/index";
import PayModalNew from "../../containers/Pay/new";
import Swiper from "../../containers/swiper/index";
import Active from "../../containers/active/index";
import GameCardCopy from "./GameCard";
import gamesIcon from "@/assets/images/home/games.svg";
import rechargeIcon from "@/assets/images/home/recharge.svg";
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
  // const [images, setImages] = useState<{ image_url: string; params: any }[]>([]);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const [images, setImages] = useState<ImageItem[]>([]);
  const imagesRef = useRef<ImageItem[]>([]); // 使用 useRef 存储数据
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  //@ts-ignore
  const [userToken, setUserToken] = useState(accountInfo.userInfo.id);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<number | null>(null);
  const [status, setStatus] = useState<number>(0); // 触发首页展示数据更新的状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenNew, setIsModalOpenNew] = useState(false);
  const [homeList, setHomeList] = useState([]);
  const [accelTag, setAccelTag] = useState({});

  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const dispatch: any = useDispatch();
  const isRealNamel = localStorage.getItem("isRealName");

  const openModal = async () => {
    const latestAccountInfo = store.getState().accountInfo;

    if (accountInfo?.isLogin) {
      if (isRealNamel === "1") {
        dispatch(openRealNameModal());
        return;
      } else if (!latestAccountInfo?.userInfo?.user_ext?.is_adult) {
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

  const throttle = (func: (...args: any[]) => void, limit: number) => {
    let lastFunc: number;
    let lastRan: number;
    return function (...args: any[]) {
      if (!lastRan) {
        func.apply(null, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = window.setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(null, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  const handleShowModal = (type: any) => {
    console.log(type, "图片的type值---------------------");

    setModalType(Number(type));
    // setIsModalOpenNew(true) first_renewed
    if (accountInfo?.isLogin) {
      if (type === "1") {
        setModalVisible(true); //新用户三天vip
      } else {
        setIsModalOpenNew(true); //非新用户充值
      }
    } else {
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // const handleImageClick = (type: number) => {
  //   setModalType(type);
  //   setIsVisible(true);
  // };

  // const handleCloseModal = () => {
  //   setIsVisible(false);
  //   setModalType(null);
  // };

  useEffect(() => {
    setHomeList(getGameList()?.slice(0, 4));
  }, [status, location]);

  useEffect(() => {
    if (location.state?.autoAccelerate && location.state?.data) {
      console.log("其他页面携带游戏进入首页");
      setAccelTag(location?.state?.data);

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

    const timer = setTimeout(fetchImages, 10);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   const handleWheel = throttle((event: WheelEvent) => {
  //     if (event.deltaY > 0) {
  //       // 滑轮向下滑动，跳转到 A 页面

  //       navigate("/myGames");
  //     } else if (event.deltaY < 0) {
  //       // 滑轮向上滑动，返回上一页

  //       navigate("/home");
  //     }
  //   }, 500); // 设置节流间隔时间为500ms

  //   window.addEventListener("wheel", handleWheel);

  //   return () => {
  //     window.removeEventListener("wheel", handleWheel);
  //   };
  // }, [navigate]);

  return (
    <div className="home-module">
      <GameCardCopy
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
      <Active isVisible={isModalVisible} onClose={handleCloseModal} />
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
          onClick={openModal}
        >
          <img src={rechargeIcon} alt="" />
          会员充值
        </div>
        <div
          className={`may-games ${
            images?.length > 0 ? "areas-list-box-auto" : "areas-list-box"
          }`}
          onClick={() => navigate("/myGames")}
        >
          <img src={gamesIcon} alt="" />
          我的游戏 ({getGameList()?.length})
        </div>
      </div>
      )}
      {!!isModalOpen && (
        <PayModal
          isModalOpen={isModalOpen}
          setIsModalOpen={(e) => setIsModalOpen(e)}
        />
      )}
      {!!isModalOpenNew && ( 
        <PayModalNew
          isModalOpen={isModalOpenNew}
          setIsModalOpen={(e) => setIsModalOpenNew(e)}
          type={modalType}
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
