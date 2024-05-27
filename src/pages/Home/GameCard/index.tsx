/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-27 11:18:10
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useEffect, useState } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import playSuitApi from "@/api/speed";
import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import closeIcon from "@/assets/images/common/close.svg";

import "./style.scss";

declare const CefWebInstance: any;

export interface GameCardProps {
  gameData?: any;
  type?: string;
  size?: "middle" | "small" | "large"; // 输入框类型 默认 middle
  onClear?: ((value: any) => void) | undefined;
  style?: React.CSSProperties;
  className?: string;
  accelTag?: object;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const { gameData = {}, type = "home", accelTag, onClear = () => {} } = props;

  const navigate = useNavigate();

  const [accelOpen, setAccelOpen] = useState(false);
  const pid = localStorage.getItem("pid");

  const handleSuitDomList = async (t: any) => {
    try {
      const [speedInfoRes, speedListRes] = await Promise.all([
        playSuitApi.speedInfo({
          platform: 3,
          gid: t,
          pid: pid,
        }),
        playSuitApi.playSpeedList({
          platform: 3,
          gid: t,
          pid: pid,
        }),
      ]);

      console.log("获取游戏加速用的信息", speedInfoRes);
      console.log("获取游戏加速列表的信息", speedListRes);

      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const process = speedInfoRes.data.executable;
      const { ip, server } = speedListRes.data[0];

      const jsonResult = {
        process: [process[0], process[1], process[2]],
        black_ip: ["42.201.128.0/17"],
        black_domain: [
          "re:.+\\.steamcommunity\\.com",
          "steamcdn-a.akamaihd.net",
        ],
        tunnel: {
          address: ip,
          server: server,
        },
      };
      const requestData = JSON.stringify({
        method: "NativeApi_StartProcessProxy",
        params: jsonResult,
      });

      (window as any).cefQuery({
        request: requestData,
        onSuccess: (response: any) => {
          console.log("加速中----------:", response);
          const jsonResponse = JSON.parse(response); //{"delay":32(这个是毫秒,9999代表超时与丢包)}
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

  // 立即加速
  const handleAccelerateClick = (option: any) => {
    console.log("option 游戏数据", option);
    let is_true = getMyGames().some((item: any) => item?.is_accelerate);

    // handleSuitDomList(option.id);

    // if (is_true) {
    //   setAccelOpen(true);
    // } else {
    //   handleExpedite(option);
    // }
  };

  // 加速逻辑
  const handleExpedite = (option: any, type: any = "on") => {
    let game_arr = getMyGames();
    console.log(type, game_arr);

    game_arr = game_arr.map((item: any) => ({
      ...item,
      is_accelerate: type === "off" ? false : option?.id === item?.id,
    }));
    console.log(game_arr);
    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_arr));

    setAccelOpen(false);

    if (type === "on") {
      handleDetails();
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

  useEffect(() => {
    console.log(222);
  }, [accelTag]);

  return (
    <div
      className={`home-module-game-card ${
        type === "home"
          ? "home-module-game-card-home"
          : "home-module-game-card-my-game"
      }`}
    >
      <div className="content-box">
        <img src={gameData?.cover_img} alt={gameData.name} />
        <div
          className="accelerate-content progress-bar animate"
          style={gameData?.is_accelerate ? { display: "block" } : {}}
        >
          {gameData?.is_accelerate ? (
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
                          marginTop: 130,
                        }
                  }
                  onClick={handleDetails}
                >
                  进入详情
                  <img src={rightArrow} alt="" />
                </div>
                <div
                  className="down-accelerate"
                  style={
                    type === "home"
                      ? {}
                      : {
                          width: 160,
                          height: 40,
                          lineHeight: "40px",
                          fontSize: 20,
                          marginLeft: "calc(50% - 80px)",
                        }
                  }
                  onClick={() => handleStopClick(gameData)}
                >
                  <img
                    style={{ width: 18, height: 18 }}
                    src={cessationIcon}
                    width={18}
                    height={18}
                    alt=""
                  />
                  停止加速
                </div>
              </div>
              <img src={acceleratedIcon} alt="" />
            </Fragment>
          ) : (
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
              {/* <div className="accelerate-animate" /> */}
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-text-box">{gameData.name}</div>
      <div
        className="accelerate-modal"
        style={{
          display: accelOpen ? "block" : "none",
        }}
      >
        其他游戏正在加速，你确定要加速此游戏吗？
        <div className="accelerate-modal-footer">
          <div className="footer-ok" onClick={() => handleExpedite(gameData)}>
            确定
          </div>
          <div className="footer-cancel" onClick={() => setAccelOpen(false)}>
            取消
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
