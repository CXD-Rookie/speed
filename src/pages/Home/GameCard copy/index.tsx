import { useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal, stopAccelerate } from "../../../redux/actions/auth";
import { setAccountInfo } from "@/redux/actions/account-info";

import MinorModal from "@/containers/minor";
import StopConfirmModal from "@/containers/stop-confirm";
import PayModal from "@/containers/Pay";
import playSuitApi from "@/api/speed";
import BreakConfirmModal from "@/containers/break-confirm";
import RealNameModal from "@/containers/real-name";

import rightArrow from "@/assets/images/common/right-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import closeIcon from "@/assets/images/common/close.svg";
import addIcon from "@/assets/images/common/add.svg";

interface GameCardProps {
  options: any;
  locationType: string;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const { options = [], locationType = "home" } = props;

  const navigate = useNavigate();

  useEffect(() => {}, []);

  return (
    <div className="game-card-box-module">
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
      {/* {options?.length < 4 && options?.length > 0 && (
        <div
          className="null-data-card"
          onClick={() => navigate("/gameLibrary")}
        >
          <div className="null-content-card">
            <img src={addIcon} alt="添加更多游戏" />
            <div>添加更多游戏</div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default GameCard;
