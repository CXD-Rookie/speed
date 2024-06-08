import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./style.scss";

import addIcon from "@/assets/images/common/add.svg";

interface GameCardProps {
  options: any;
  locationType: string;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const { options = [], locationType = "home" } = props;

  const navigate = useNavigate();

  const isHomeNullCard =
    locationType === "home" && options?.length < 4 && options?.length > 0; // 判断是否是首页无数据卡片条件

  useEffect(() => {}, []);

  return (
    <div
      className={`game-card-module ${
        locationType === "home" && "home-game-card-module"
      }`}
    >
      {options?.map((option: any) => {
        return (
          <div className={`game-card`} key={option?.id}>
            {/* <img
              className="background-img"
              src={option?.cover_img}
              alt={option.name}
            />
            <div>111</div> */}
          </div>
        );
      })}
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
    </div>
  );
};

export default GameCard;
