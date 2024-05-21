/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-21 21:11:18
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useState } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import "./style.scss";

declare const CefWebInstance: any;

export interface GameCardProps {
  gameData?: any;
  isAccelerate?: boolean;
  gameAccelerateList?: any;
  setGameAccelerateList?: ((value: any) => void) | undefined;
  type?: string;
  size?: "middle" | "small" | "large"; // 输入框类型 默认 middle
  onChange?: ((value: object) => void) | undefined;
  style?: React.CSSProperties;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const {
    gameData = {},
    type = "home",
    isAccelerate = false,
    gameAccelerateList = [],
    setGameAccelerateList = () => {},
  } = props;

  const navigate = useNavigate();

  const [accelOpen, setAccelOpen] = useState(false);

  const handleAccelerateClick = () => {
    if (gameAccelerateList?.length < 1) {
      setGameAccelerateList([gameData.id]);
      localStorage.setItem(
        "speed-1.0.0.1-accelerate",
        JSON.stringify([gameData.id])
      );
    } else {
      setAccelOpen(true);
    }
  };

  const handleStopClick = () => {
    setGameAccelerateList([]);

    localStorage.setItem("speed-1.0.0.1-accelerate", JSON.stringify([]));
  };

  return (
    <div
      className={`home-module-game-card ${
        type === "home"
          ? "home-module-game-card-home"
          : "home-module-game-card-my-game"
      }`}
    >
      <div className="content-box">
        <img src={gameData.image} alt={gameData.name} />
        <div
          className="accelerate-content"
          style={isAccelerate ? { display: "block" } : {}}
        >
          {isAccelerate ? (
            <Fragment>
              <div className="t2">
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
                    onClick={handleAccelerateClick}
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
                    onClick={handleStopClick}
                  >
                    停止加速
                  </div>
                </div>
                <img src={acceleratedIcon} alt="" />
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div
                className="accelerate-button"
                onClick={handleAccelerateClick}
              >
                立即加速
              </div>
              <img className="on-accel-img" src={accelerateIcon} alt="" />
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-text-box">{gameData.name}</div>
      <div
        style={{
          width: "400px",
          display: accelOpen ? "block" : "none",
          position: "fixed",
          top: "200px",
          left: "calc(50% - 200px)",
          background: "rgba(0,0,0, 0.7)",
          borderRadius: "20px",
          padding: "53px",
          zIndex: 10,
          color: "#FFF",
        }}
      >
        其他游戏正在加速，你确定要加速此游戏吗？
        <div style={{ display: "flex", marginTop: "20px" }}>
          <div
            style={{
              padding: "8px 16px",
              background: "#F86C34",
              borderRadius: "8px",
            }}
            onClick={() => {
              setGameAccelerateList([gameData.id]);
              localStorage.setItem(
                "speed-1.0.0.1-accelerate",
                JSON.stringify([gameData.id])
              );
              setAccelOpen(false);
            }}
          >
            确定
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              marginLeft: "20px",
            }}
            onClick={() => {
              setAccelOpen(false);
            }}
          >
            取消
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
