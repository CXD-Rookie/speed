/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 17:02:05
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
// 在 GameCard 组件中添加一个暴露的方法，例如 useImperativeHandle 和 forwardRef
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

import PayModal from "@/containers/Pay";
import playSuitApi from "@/api/speed";
import BreakConfirmModal from "@/containers/break-confirm";

import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import closeIcon from "@/assets/images/common/close.svg";

import { useDispatch, useSelector } from "react-redux";
import { setIsLogin, openRealNameModal } from "../../../redux/actions/auth";

import "./style.scss";

declare const CefWebInstance: any;

export interface GameCardProps {
  gameData?: any;
  type?: string;
  size?: "middle" | "small" | "large"; // 输入框类型 默认 middle
  onClear?: ((value: any) => void) | undefined;
  setAccelTag?: (value: any) => void;
  style?: React.CSSProperties;
  className?: string;
  accelTag?: object;
  id?: string;
}

const GameCard: React.ForwardRefRenderFunction<any, GameCardProps> = (
  props,
  ref
) => {
  const {
    gameData = {},
    type = "home",
    accelTag = {},
    onClear = () => {},
    setAccelTag = () => {},
    id,
  } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const isRealName = localStorage.getItem("isRealName");
  const pid = localStorage.getItem("pid");

  const [accelOpen, setAccelOpen] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false); // 是否开始加速动画

  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerAccelerate: (e: any) => {
      handleAccelerateClick(e);
    },
  }));

  useEffect(() => {
    if (
      Object.keys(accelTag || {})?.length > 0 &&
      (accelTag as any)?.id === gameData?.id
    ) {
      if ((accelTag as any)?.router === "details") {
        handleExpedite(accelTag);
      } else {
        handleAccelerateClick(accelTag);
      }
    }
  }, [accelTag]);

  const handleSuitDomList = async (t: any) => {
    try {
      const [speedInfoRes, speedListRes] = await Promise.all([
        playSuitApi.speedInfo({ platform: 3, gid: t, pid: pid }),
        playSuitApi.playSpeedList({ platform: 3, gid: t, pid: pid }),
      ]);

      console.log("获取游戏加速用的信息", speedInfoRes);
      console.log("获取游戏加速列表的信息", speedListRes);
      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const process = speedInfoRes.data.executable;
      const { ip, server } = speedListRes.data[0];

      localStorage.setItem("speedIp", ip);
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
      // 虚假拼接
      //  const jsonResult = {
      //   process: [process[0], process[1], process[2]],
      //   black_ip: ["42.201.128.0/17"],
      //   black_domain: [
      //     "re:.+\\.steamcommunity\\.com",
      //     "steamcdn-a.akamaihd.net",
      //   ],
      //   tunnel: {
      //     "address": "192.168.111.105",
      //     "server": [
      //         {
      //             "port": 18080,
      //             "protocol": {
      //                 "from": "quic",
      //                 "to": "tcp"
      //             }
      //         },
      //         {
      //             "port": 18081,
      //             "protocol": {
      //                 "from": "quic",
      //                 "to": "udp"
      //             }
      //         },
      //         {
      //             "port": 19080,
      //             "protocol": {
      //                 "from": "kcp",
      //                 "to": "tcp"
      //             }
      //         },
      //         {
      //             "port": 38081,
      //             "protocol": {
      //                 "from": "xudp",
      //                 "to": "udp"
      //             }
      //         }
      //     ]
      // }
      // };
      const requestData = JSON.stringify({
        method: "NativeApi_StartProcessProxy",
        params: jsonResult,
      });

      (window as any).cefQuery({
        request: requestData,
        onSuccess: (response: any) => {
          console.log("开启真实加速中----------:", response);
        },
        onFailure: (errorCode: any, errorMessage: any) => {
          console.error("加速失败 failed:", errorMessage);
        },
      });

      console.log("拼接后的 JSON 对象:", jsonResult);

      // 假设你需要根据两个请求的结果更新 state
      // setRegionDomList(jsonResult); // 根据实际需求更新 state
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpen = () => {
    dispatch(openRealNameModal());
  };

  // 立即加速
  const handleAccelerateClick = (option: any) => {
    if (accountInfo?.isLogin) {
      if (!accountInfo?.userInfo?.is_vip) {
        setIsModalOpenVip(true);

        return;
      }

      if (isRealName === "1") {
        handleOpen();
      } else {
        console.log("option 游戏数据", option);
        let is_true = getMyGames().some((item: any) => item?.is_accelerate);

        if (is_true) {
          setAccelOpen(true);
        } else {
          handleExpedite(option);
        }
      }
    } else {
      console.log("没登录--------------------------");
      dispatch(setIsLogin(true));
    }
  };

  // 加速逻辑
  const handleExpedite = (option: any, type: any = "on") => {
    let game_arr = getMyGames();
    console.log(type, game_arr);

    game_arr = game_arr.map((item: any) => ({
      ...item,
      is_accelerate: type === "off" ? false : option?.id === item?.id,
    }));

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_arr));

    setAccelOpen(false);

    if (type === "on") {
      setIsAnimate(true);

      setTimeout(() => {
        setAccelTag({});
        setIsAnimate(false);
        const requestDataStep = JSON.stringify({
          method: "NativeApi_PreCheckEnv",
        });
        (window as any).cefQuery({
          request: requestDataStep,
          onSuccess: (response: any) => {
            console.log("校验是否合法文件----------:", response);
            const isCheck = JSON.parse(response);
            // handleSuitDomList(option.id);

            if (isCheck.pre_check_status === 0) {
              handleSuitDomList(option.id);
            } else {
              console.log(`不是合法文件，请重新安装加速器`);
            }
          },
          onFailure: (errorCode: any, errorMessage: any) => {
            console.error("加速失败 failed:", errorMessage);
          },
        });

        handleDetails();
      }, 5000);
    }

    if (type === "off") {
      onClear(true);
    }
  };

  // 进入详情
  const handleDetails = () => {
    navigate("/gameDetail");
  };

  // 停止加速
  const handleStopClick = (option: any) => {
    console.log("stop speed--------------------------");
    const requestData = JSON.stringify({
      method: "NativeApi_StopProxy",
      params: null,
    });
    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("停止加速----------:", response);
        handleExpedite(option, "off");
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("加速失败 failed:", errorMessage);
      },
    });
  };

  const handleClearGame = (options: any) => {
    let result: any = [];

    getMyGames()?.forEach((item: any) => {
      if (item?.id !== options?.id) {
        result.push(item);
      }
    });

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(result));
    onClear(result);
  };

  return (
    <div
      className={`home-module-game-card ${
        type === "home"
          ? "home-module-game-card-home"
          : "home-module-game-card-my-game"
      }`}
      id={id}
    >
      <div className="content-box">
        <img src={gameData?.cover_img} alt={gameData.name} />
        <div
          className="accelerate-content"
          style={gameData?.is_accelerate ? { display: "block" } : {}}
        >
          {gameData?.is_accelerate && !isAnimate && (
            <Fragment>
              <div className="accelerated-content">
                {type === "home" && (
                  <>
                    <div className="instant-delay">即时延迟</div>
                    <div className="speed">
                      98<span>ms</span>
                    </div>
                  </>
                )}
                <div
                  className="go-deteils"
                  style={
                    type === "home"
                      ? {}
                      : {
                          marginTop: "4.2vh",
                        }
                  }
                  onClick={handleDetails}
                >
                  进入详情
                  <img src={rightArrow} alt="" />
                </div>
                <div
                  className="down-accelerate"
                  onClick={() => handleStopClick(gameData)}
                >
                  <img src={cessationIcon} width={18} height={18} alt="" />
                  停止加速
                </div>
              </div>
              <img src={acceleratedIcon} alt="" />
            </Fragment>
          )}
          {!gameData?.is_accelerate && !isAnimate && (
            <Fragment>
              <img
                className="clear-game"
                src={closeIcon}
                alt=""
                onClick={() => handleClearGame(gameData)}
              />
              <div
                className="accelerate-button"
                onClick={() => handleAccelerateClick(gameData)}
              >
                立即加速
                <img src={arrowIcon} width={18} height={18} alt="" />
              </div>
              <img className="on-accel-img" src={accelerateIcon} alt="" />
            </Fragment>
          )}
        </div>
        {isAnimate && (
          <div className={"animate-box"}>
            <div className={"animate-text"}>加速中...</div>
            <div
              className={`accelerate-animate ${
                isAnimate && "accelerate-animate-start"
              }`}
            />
          </div>
        )}
      </div>
      <div className="card-text-box">{gameData.name}</div>
      <BreakConfirmModal
        accelOpen={accelOpen}
        setAccelOpen={setAccelOpen}
        onConfirm={() => {
          onClear(true);

          handleExpedite(
            Object?.keys(accelTag || {})?.length > 0 ? accelTag : gameData
          );
        }}
      />
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
    </div>
  );
};

export default forwardRef(GameCard);
