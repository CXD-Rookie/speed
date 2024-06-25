/*
 * @Author: zhangda
 * @Date: 2024-06-08 13:30:02
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-25 20:38:40
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import { openRealNameModal } from "@/redux/actions/auth";
import { useHandleUserInfo } from "@/hooks/useHandleUserInfo";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { store } from "@/redux/store";
import useCefQuery from "@/hooks/useCefQuery";
import "./style.scss";
import RealNameModal from "@/containers/real-name";
import MinorModal from "@/containers/minor";
import PayModal from "@/containers/Pay";
import BreakConfirmModal from "@/containers/break-confirm";

import playSuitApi from "@/api/speed";

import addIcon from "@/assets/images/common/add.svg";
import select from "@/assets/images/home/select@2x.png";
import closeIcon from "@/assets/images/common/close.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import rightArrow from "@/assets/images/common/right-arrow.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";

interface GameCardProps {
  options: any;
  locationType: string;
  customAccelerationData?: any;
  triggerDataUpdate?: () => void;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const {
    options = [],
    locationType = "home",
    customAccelerationData = {},
    triggerDataUpdate = () => {},
  } = props;

  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 获取 redux 中的用户信息
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen); // 实名认证
  const accDelay = useSelector((state: any) => state.auth.delay); // 延迟毫秒数
  const [isModalVisible, setIsModalVisible] = useState(false);
  const sendMessageToBackend = useCefQuery();
  const historyContext: any = useHistoryContext();

  const {
    getGameList,
    identifyAccelerationData,
    removeGameList,
    accelerateGameToList,
  } = useGamesInitialize();

  const { handleUserInfo } = useHandleUserInfo();

  const [minorType, setMinorType] = useState<string>("acceleration"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框
  const [startKey, setStartKey] = useState<string>(""); // 是否成年 类型充值还是加速
  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip

  const [accelOpen, setAccelOpen] = useState(false); // 是否确认加速
  const [stopModalOpen, setStopModalOpen] = useState(false); // 停止加速确认
  const [isStartAnimate, setIsStartAnimate] = useState(false); // 是否开始加速动画
  const [selectAccelerateOption, setSelectAccelerateOption] = useState<any>(); // 选择加速的数据
  const token = localStorage.getItem("token") || "";
  const [isAllowAcceleration, setIsAllowAcceleration] = useState<boolean>(true); // 是否允许加速
  const [isAllowShowAccelerating, setIsAllowShowAccelerating] =
    useState<boolean>(true); // 是否允许显示加速中

  const isHomeNullCard =
    locationType === "home" && options?.length < 4 && options?.length > 0; // 判断是否是首页无数据卡片条件

  // 停止加速
  const stopAcceleration = () => {
    console.log("1111111111")
    setStopModalOpen(false);
    // 停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        removeGameList("initialize"); // 更新我的游戏
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        triggerDataUpdate(); // 更新显示数据
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  // 通知客户端进行游戏加速
  const handleSuitDomList = async (t: any) => {
    try {
      const pid = localStorage.getItem("pid");
      const [speedInfoRes, speedListRes] = await Promise.all([
        playSuitApi.speedInfo({ platform: 3, gid: t, pid }), // 游戏加速信息
        playSuitApi.playSpeedList({ platform: 3, gid: t, pid }), // 游戏加速节点列表
      ]);

      console.log("获取游戏加速用的信息", speedInfoRes);
      console.log("获取游戏加速列表的信息", speedListRes);

      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const process = speedInfoRes.data.executable;
      const { ip, server,id } = speedListRes.data[0];//目前只有一个服务器，后期增多要遍历
      const StartInfo = await playSuitApi.playSpeedStart({ platform: 3, gid: t, nid:id }); // 游戏加速信息
      console.log("开始加速接口调用返回信息",StartInfo)
      setStartKey(id)
      localStorage.setItem("StartKey", id);
      localStorage.setItem("speedIp", ip);
      localStorage.setItem("speedGid", t);
      localStorage.setItem("speedInfo", JSON.stringify(speedInfoRes));

      // 真实拼接
      const jsonResult = {
        process: [process[0], process[1], process[2]],
        black_ip: ["42.201.128.0/17"],
        black_domain: [
          "re:.+\\.steamcommunity\\.com",
          "steamcdn-a.akamaihd.net",
        ],
        tcp_tunnel_mode: 0,
        udp_tunnel_mode: 1,
        user_id: accountInfo?.userInfo?.id,
        game_id: t,
        tunnel: {
          address: ip,
          server: server,
        },
      };

      // 真实加速
      sendMessageToBackend(
        JSON.stringify({
          method: "NativeApi_StartProcessProxy",
          params: jsonResult,
        }),
        (response: any) => {
          console.log("Success response from 开启真实加速中:", response);
        },
        (errorCode: any, errorMessage: any) => {
          console.error(
            "Failure response from 加速失败:",
            errorCode,
            errorMessage
          );
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  // 加速实际操作
  const accelerateProcessing = (option = selectAccelerateOption) => {
    setIsAllowAcceleration(false); // 禁用立即加速
    setIsAllowShowAccelerating(false); // 禁用显示加速中
    setIsStartAnimate(true); // 开始加速动画
    stopAcceleration(); // 停止加速

    // 校验是否合法文件
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_PreCheckEnv",
      }),
      (response: any) => {
        console.log("Success response from 校验是否合法文件:", response);
        const isCheck = JSON.parse(response);

        accelerateGameToList(option); // 加速完后更新我的游戏
        handleSuitDomList(option.id); // 通知客户端进行加速
        // 暂时注释 实际生产打开
        // if (isCheck?.pre_check_status === 0) {
        //   handleSuitDomList(option.id);
        // } else {
        //   console.log(`不是合法文件，请重新安装加速器`);
        // }
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 校验是否合法文件:", errorCode);
      }
    );

    setTimeout(() => {
      setIsAllowAcceleration(true); // 启用立即加速
      setIsAllowShowAccelerating(true); // 启用显示加速中
      setIsStartAnimate(false); // 结束加速动画

      navigate("/gameDetail");
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

  const openSelect = (option: object) => {
    console.log("打开 区服列表");
    showModal();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  // 点击立即加速
  const accelerateDataHandling = async (option: object) => {
    if (accountInfo?.isLogin) {
      let res = await handleUserInfo(); // 先请求用户信息，进行用户信息的更新

      if (res) {
        const latestAccountInfo = store.getState().accountInfo;
        const userInfo = latestAccountInfo?.userInfo; // 用户信息
        // 是否登录
        const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息

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
          accelerateProcessing(option);
          setSelectAccelerateOption(option);
        }
      }
    } else {
      dispatch(setAccountInfo(undefined, undefined, true)); // 未登录弹出登录框
    }
  };

  // 如果有自定义的加速数据 则替换选择加速数据 并且进行加速
  useEffect(() => {
    if (Object.keys(customAccelerationData)?.length > 0) {
      setSelectAccelerateOption(customAccelerationData);
      accelerateDataHandling(customAccelerationData);
    }
  }, [customAccelerationData]);

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
              <div
                className="accelerate-immediately-card"
                onClick={() => accelerateDataHandling(option)}
              >
                <img className="mask-layer-img" src={accelerateIcon} alt="" />
                <img
                  className="select-game-img"
                  src={select}
                  alt=""
                  onClick={(e) => {
                    e.stopPropagation();
                    openSelect(option);
                  }}
                />
                <img
                  className="clear-game-img"
                  src={closeIcon}
                  alt=""
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearGame(option);
                  }}
                />
                <div className="accelerate-immediately-button">
                  <span className="accelerate-immediately-text">立即加速</span>
                  <img
                    className="accelerate-immediately-img"
                    src={arrowIcon}
                    alt=""
                    // onClick={() => accelerateDataHandling(option)}
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
              <div
                className="accelerating-card"
                onClick={() => navigate("/gameDetail")}
              >
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
                  <div className="enter-details">
                    <span>进入详情</span>
                    <img src={rightArrow} alt="" />
                  </div>
                  <div
                    className="down-accelerate"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStopModalOpen(true);
                    }}
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
        type={"accelerate"}
        setAccelOpen={setAccelOpen}
        onConfirm={confirmStartAcceleration}
      />
      {/* 停止加速确认弹窗 */}
      {stopModalOpen ? (
        <BreakConfirmModal
          accelOpen={stopModalOpen}
          type={"stopAccelerate"}
          setAccelOpen={setStopModalOpen}
          onConfirm={stopAcceleration}
        />
      ) : null}
    </div>
  );
};

export default GameCard;
