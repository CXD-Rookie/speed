/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-22 16:16:52
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useState } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

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
  const { gameData = {}, type = "home" } = props;

  const navigate = useNavigate();

  const [accelOpen, setAccelOpen] = useState(false);

  // 立即加速
  const handleAccelerateClick = (option: any) => {
    let is_true = getMyGames().some((item: any) => item?.is_accelerate);

    if (is_true) {
      setAccelOpen(true);
    } else {
      handleExpedite(option);
    }
  };

  // 加速逻辑
  const handleExpedite = (option: any) => {
    let game_arr = getMyGames();

    game_arr = game_arr.map((item: any) => ({
      ...item,
      is_accelerate: option?.id === item?.id,
    }));

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_arr));

    setAccelOpen(false);
    handleDetails();
  };

  // 进入详情
  const handleDetails = () => {
    navigate("/gameDetail");
  };

  // 停止加速
  const handleStopClick = (option: any) => {
    handleExpedite(option);
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
        <img src={gameData?.cover_img} alt={gameData.name} />
        <div
          className="accelerate-content"
          style={gameData?.is_accelerate ? { display: "block" } : {}}
        >
          {gameData?.is_accelerate ? (
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
                onClick={() => handleAccelerateClick(gameData)}
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
