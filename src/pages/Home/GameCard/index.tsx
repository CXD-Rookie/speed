import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import { openRealNameModal } from "@/redux/actions/auth";
import { useHandleUserInfo } from "@/hooks/useHandleUserInfo";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./style.scss";
import RealNameModal from "@/containers/real-name";
import MinorModal from "@/containers/minor";
import PayModal from "@/containers/Pay";
import BreakConfirmModal from "@/containers/break-confirm";
import StopConfirmModal from "@/containers/stop-confirm";

import addIcon from "@/assets/images/common/add.svg";
import closeIcon from "@/assets/images/common/close.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import rightArrow from "@/assets/images/common/right-arrow.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";

interface GameCardProps {
  options: any;
  locationType: string;
  triggerDataUpdate?: () => void;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const {
    options = [],
    locationType = "home",
    triggerDataUpdate = () => {},
  } = props;

  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 获取 redux 中的用户信息
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen); // 实名认证
  const accDelay = useSelector((state: any) => state.auth.delay); // 延迟毫秒数

  const { getGameList, identifyAccelerationData, removeGameList } =
    useGamesInitialize();
  const { handleUserInfo } = useHandleUserInfo();

  const [minorType, setMinorType] = useState<string>("acceleration"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip

  const [accelOpen, setAccelOpen] = useState(false); // 是否确认加速
  const [stopModalOpen, setStopModalOpen] = useState(false); // 停止加速确认
  const [isStartAnimate, setIsStartAnimate] = useState(false); // 是否开始加速动画
  const [selectAccelerateOption, setSelectAccelerateOption] = useState<any>(); // 选择加速的数据

  const [isAllowAcceleration, setIsAllowAcceleration] = useState<boolean>(true); // 是否允许加速
  const [isAllowShowAccelerating, setIsAllowShowAccelerating] =
    useState<boolean>(true); // 是否允许显示加速中

  const isHomeNullCard =
    locationType === "home" && options?.length < 4 && options?.length > 0; // 判断是否是首页无数据卡片条件

  // 停止加速
  const stop = () => {
    setStopModalOpen(false);
    // handleStopClick(gameData);
  };

  // 加速实际操作
  const accelerateProcessing = (option = selectAccelerateOption) => {
    setIsAllowAcceleration(false); // 禁用立即加速
    setIsAllowShowAccelerating(false); // 禁用显示加速中
    setIsStartAnimate(true); // 开始加速动画

    setTimeout(() => {
      setIsAllowAcceleration(true); // 启用立即加速
      setIsAllowShowAccelerating(true); // 启用显示加速中
      setIsStartAnimate(false); // 结束加速动画
    }, 5000);
  };

  // 确认开始加速
  const confirmStartAcceleration = () => {
    setAccelOpen(false); // 关闭确认框
    accelerateProcessing();
  };

  // 清除选择卡片
  const handleClearGame = (option: object) => {
    removeGameList(option);
    triggerDataUpdate();
  };

  // 点击立即加速
  const accelerateDataHandling = (option: object) => {
    handleUserInfo(); // 先请求用户信息，进行用户信息的更新

    // 是否登录
    if (accountInfo?.isLogin) {
      const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息
      const userInfo = accountInfo?.userInfo; // 用户信息

      let game_list = getGameList(); // 获取当前我的游戏列表
      let find_accel = identifyAccelerationData(game_list); // 查找是否有已加速的信息

      // 是否实名认证 isRealNamel === "1" 是
      // 是否是未成年
      // 是否是vip
      // 是否有加速中的游戏
      if (isRealNamel === "1") {
        dispatch(openRealNameModal());
        return;
      } else if (!userInfo?.user_ext?.is_adult) {
        setIsMinorOpen(true);
        setMinorType("acceleration");
        return;
      } else if (!userInfo?.is_vip) {
        setIsModalOpenVip(true);
        return;
      } else if (find_accel?.[0]) {
        setAccelOpen(true);
        setSelectAccelerateOption(option);
        return;
      } else {
      }
    } else {
      dispatch(setAccountInfo(undefined, undefined, true)); // 未登录弹出登录框
    }
  };

  useEffect(() => {}, []);

  return (
    <div
      className={`game-card-module ${
        locationType === "home" && "home-game-card-module"
      } ${locationType === "my-game" && "my-game-card-module"}`}
    >
      {options?.map((option: any) => {
        return (
          <div className={`game-card`} key={option?.id}>
            <img
              className="background-img"
              src={option?.cover_img}
              alt={option.name}
            />
            {/* 立即加速卡片 */}
            {isAllowAcceleration ? (
              <div className="accelerate-immediately-card">
                <img className="mask-layer-img" src={accelerateIcon} alt="" />
                <img
                  className="clear-game-img"
                  src={closeIcon}
                  alt=""
                  onClick={() => handleClearGame(option)}
                />
                <div className="accelerate-immediately-button">
                  <span
                    className="accelerate-immediately-text"
                    onClick={() => accelerateDataHandling(option)}
                  >
                    立即加速
                  </span>
                  <img
                    className="accelerate-immediately-img"
                    src={arrowIcon}
                    alt=""
                    onClick={() => accelerateDataHandling(option)}
                  />
                </div>
              </div>
            ) : null}
            {/* 加速动画卡片 */}
            {isStartAnimate && selectAccelerateOption?.id === option?.id ? (
              <div className={"accelerate-animate-card"}>
                <div className={"animate-text"}>加速中...</div>
                <div
                  className={`accelerate-animate ${
                    isStartAnimate && "accelerate-animate-start"
                  }`}
                />
              </div>
            ) : null}
            {/* 加速中卡片 */}
            {isAllowShowAccelerating && option?.is_accelerate ? (
              <div className="accelerating-card">
                <img
                  className="accelerating-content-img"
                  src={acceleratedIcon}
                  alt=""
                />
                <div className="accelerating-content">
                  {locationType === "home" && (
                    <>
                      <div className="instant-delay">即时延迟</div>
                      <div className="speed">
                        {accDelay || 2}
                        <span>ms</span>
                      </div>
                    </>
                  )}
                  <div
                    className="enter-details"
                    onClick={() => navigate("/gameDetails")}
                  >
                    <span>进入详情</span>
                    <img src={rightArrow} alt="" />
                  </div>
                  <div
                    className="down-accelerate"
                    onClick={() => setStopModalOpen(true)}
                  >
                    <img src={cessationIcon} width={18} height={18} alt="" />
                    <span>停止加速</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="game-card-text">{option?.name}</div>
          </div>
        );
      })}
      {/* 首页数据不足4个时 触发添加数据卡片 */}
      {isHomeNullCard && (
        <div
          className="home-null-card"
          onClick={() => navigate("/gameLibrary")}
        >
          <div className="null-content-card">
            <img src={addIcon} alt="添加更多游戏" />
            <div>添加更多游戏</div>
          </div>
        </div>
      )}
      {/* 实名认证弹窗 */}
      {isRealOpen ? <RealNameModal /> : null}
      {/* 未成年成年弹窗 */}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
      {/* vip 充值弹窗 */}
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {/* 确认加速弹窗 */}
      <BreakConfirmModal
        accelOpen={accelOpen}
        setAccelOpen={setAccelOpen}
        onConfirm={confirmStartAcceleration}
      />
      {/* 停止加速确认弹窗 */}
      {stopModalOpen ? (
        <StopConfirmModal
          accelOpen={stopModalOpen}
          setAccelOpen={setStopModalOpen}
          onConfirm={stop}
        />
      ) : null}
    </div>
  );
};

export default GameCard;
