/*
 * @Author: zhangda
 * @Date: 2024-04-22 14:17:10
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-22 16:22:04
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";

import "./style.scss";

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

  const handleAccelerateClick = () => {
    navigate("/gameDetail");
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
                >
                  停止加速
                </div>
              </div>
              <img src={acceleratedIcon} alt="" />
            </Fragment>
          ) : (
            <Fragment>
              <div className="accelerate-button">立即加速</div>
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
