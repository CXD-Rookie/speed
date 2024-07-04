/*
 * @Author: zhangda
 * @Date: 2024-06-08 13:30:02
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-04 18:24:24
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

import "./style.scss";
import RegionNodeSelector from "@/containers/RegionNodeSelector";
import useCefQuery from "@/hooks/useCefQuery";
import RealNameModal from "@/containers/real-name";
import MinorModal from "@/containers/minor";
import PayModal from "@/containers/Pay";
import BreakConfirmModal from "@/containers/break-confirm";
import eventBus from "@/api/eventBus";
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

  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip
  const [renewalOpen, setRenewalOpen] = useState(false); // 续费提醒
  const [isOpenRegion, setIsOpenRegion] = useState(false); // 是否是打开选择区服节点

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
  const stopAcceleration = () => {
    setStopModalOpen(false);
    // playSuitApi.playSpeedEnd({
    //   platform: 3,
    //   js_key: localStorage.getItem("StartKey"),
    // }); // 游戏停止加速
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

  // 获取游戏运营平台列表
  const fetchPcPlatformList = async () => {
    try {
      let res = await playSuitApi.pcPlatform();

      return res?.data;
    } catch (error) {
      console.log(error);
    }
  };

  // 通知客户端进行游戏加速
  const handleSuitDomList = async (option: any) => {
    try {
      let res = await fetchPcPlatformList(); // 请求运营平台接口
      let platform_list = Object?.keys(res) || []; // 运营平台数据
      let api_list: any = []; // 需要请求的api 数量

      // 对api数量进行处理
      platform_list.forEach((key: string) => {
        api_list.push(
          playSuitApi.speedInfo({
            platform: 3,
            gid: option?.id,
            pid: key,
          })
        );
      });

      const data: any = await Promise.all(api_list); // 请求等待统一请求完毕
      // 聚合所以的api 数据中的 executable
      const result_excutable = data.reduce((acc: any, item: any) => {
        if (item.data.executable) {
          return acc.concat(item.data.executable);
        }
        return acc;
      }, []);

      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const { ip, server, id } = option?.dom_info?.select_dom; //目前只有一个服务器，后期增多要遍历
      const startInfo = await playSuitApi.playSpeedStart({
        platform: 3,
        gid: option?.id,
        nid: id,
      }); // 游戏加速信息
      const js_key = startInfo?.data?.js_key;

      localStorage.setItem("StartKey", id);
      localStorage.setItem("speedIp", ip);
      localStorage.setItem("speedGid", option?.id);

      // 真实拼接
      const jsonResult = {
        process: [...result_excutable],
        black_ip: ["42.201.128.0/17"],
        black_domain: [
          "re:.+\\.steamcommunity\\.com",
          "steamcdn-a.akamaihd.net",
        ],
        tcp_tunnel_mode: 0,
        udp_tunnel_mode: 1,
        user_id: accountInfo?.userInfo?.id,
        game_id: option?.id,
        tunnel: {
          address: ip,
          server: server,
        },
        js_key,
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
          // 无法启动加速服务
          eventBus.emit("showModal", {
            show: true,
            type: "accelerationServiceNotStarting",
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  // 加速实际操作
  const accelerateProcessing = (option = selectAccelerateOption) => {
    if (!option?.dom_info?.select_dom?.id) {
      setIsOpenRegion(true);
      return;
    }

    setIsAllowAcceleration(false); // 禁用立即加速
    setIsAllowShowAccelerating(false); // 禁用显示加速中
    setIsStartAnimate(true); // 开始加速动画
    stopAcceleration(); // 停止加速

    let isPre: boolean;

    // 校验是否合法文件
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_PreCheckEnv",
      }),
      (response: any) => {
        console.log("Success response from 校验是否合法文件:", response);
        const isCheck = JSON.parse(response);
        accelerateGameToList(option); // 加速完后更新我的游戏
        handleSuitDomList(option); // 通知客户端进行加速
        // 暂时注释 实际生产打开
        if (isCheck?.pre_check_status === 0) {
          isPre = true;
          accelerateGameToList(option); // 加速完后更新我的游戏
          handleSuitDomList(option); // 通知客户端进行加速
        } else {
          console.log(`不是合法文件，请重新安装加速器`);
          eventBus.emit("showModal", {
            show: true,
            type: "infectedOrHijacked",
          });
        }
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 校验是否合法文件:", errorCode);
        eventBus.emit("showModal", { show: true, type: "infectedOrHijacked" });
      }
    );

    setTimeout(() => {
      setIsAllowAcceleration(true); // 启用立即加速
      setIsAllowShowAccelerating(true); // 启用显示加速中
      setIsStartAnimate(false); // 结束加速动画

      if (isPre) {
        navigate("/gameDetail");
      }
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
  const accelerateDataHandling = async (option: any, type = "default") => {
    // 是否登录
    if (accountInfo?.isLogin) {
      let res = await handleUserInfo(); // 先请求用户信息，进行用户信息的更新

      if (res) {
        const latestAccountInfo = store.getState().accountInfo;
        const userInfo = latestAccountInfo?.userInfo; // 用户信息
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
        } else if (!options?.free_time && !userInfo?.is_vip) {
          setIsModalOpenVip(true);
          return;
        } else if (find_accel?.[0]) {
          setAccelOpen(true);
          setSelectAccelerateOption(option);
          return;
        } else {
          let time = new Date().getTime() / 1000;
          let renewalTime = Number(localStorage.getItem("renewalTime")) || 0;

          if (
            time - renewalTime > 86400 &&
            userInfo?.vip_expiration_time - time <= 432000
          ) {
            setRenewalOpen(true);
            localStorage.setItem("renewalTime", String(time));
          } else {
            accelerateProcessing(option);
            setSelectAccelerateOption(option);
          }
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
                    setIsOpenRegion(true);
                    setSelectAccelerateOption(option);
                    // accelerateDataHandling(option, "custom");
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
                <div
                  className="accelerate-immediately-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    accelerateDataHandling(option);
                  }}
                >
                  <span className="accelerate-immediately-text">立即加速</span>
                  <img
                    className="accelerate-immediately-img"
                    src={arrowIcon}
                    alt=""
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
      {isOpenRegion ? (
        <RegionNodeSelector
          open={isOpenRegion}
          type={"acelerate"}
          options={selectAccelerateOption}
          onCancel={() => {
            triggerDataUpdate();
            setIsOpenRegion(false);
          }}
          notice={(e) => accelerateProcessing(e)}
        />
      ) : null}
      {/* 续费提醒确认弹窗 */}
      {renewalOpen ? (
        <BreakConfirmModal
          accelOpen={renewalOpen}
          type={"renewalReminder"}
          setAccelOpen={setRenewalOpen}
          onConfirm={() => {
            setRenewalOpen(false);
            setIsModalOpenVip(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default GameCard;
