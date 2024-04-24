/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-24 16:59:33
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useState } from "react";
import { Fragment } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";

import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import "./style.scss";
declare const CefWebInstance: any;
export interface GameCardProps {
  gameData?: any;
  type?: string;
  size?: "middle" | "small" | "large"; // 输入框类型 默认 middle
  onChange?: ((value: object) => void) | undefined;
  style?: React.CSSProperties;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const { gameData = {}, type = "home" } = props;

  const navigate = useNavigate();
  const _start = localStorage.getItem("startSpeed");

  const [showT1, setShowT1] = useState(true);
  const [showT2, setShowT2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccelerateClick = () => {
    console.log("333");
   
    setShowT1(false);
    setShowT2(true);
    
      // CefWebInstance.call('jsCallStartSpeed', { message:'jsCallStartSpeed' }, (error: any, result1: any) => {
      //   console.log("zbc123")
      //   console.log(error)
      //   console.log(result1)
      //   localStorage.setItem("startSpeed","1")
      //   navigate("/gameDetail");
      // })
  };

  const handleStopClick = () => {
    console.log("333");
    CefWebInstance.call('jsCallStopSpeed', { message:'jsCallStopSpeed' }, (error: any, result1: any) => {
    console.log("stop111111111111111")
    console.log(error)
    console.log(result1)
    })
  
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
        <div className="accelerate-content">
          {gameData?.is_accelerate === true ? (
            <Fragment>
              {showT1 && (
                <div className="t1">
                  <div className="accelerate-button" onClick={handleAccelerateClick}>立即加速</div>
                  <img src={accelerateIcon} alt="" />
                </div>
              )}

              {showT2 && (
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
              )}
            </Fragment>
          ) : (
            <Fragment>
              <div className="accelerate-button" onClick={handleAccelerateClick}>立即加速</div>
              <img src={accelerateIcon} alt="" />
            </Fragment>
          )}
        </div>
      </div>
      <div className="card-text-box">{gameData.name}</div>
    </div>
  );
};

export default GameCard;
