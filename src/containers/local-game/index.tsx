import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLocalGameState } from "@/redux/actions/modal-open";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";
import eventBus from "@/api/eventBus";
import closeIcon from "@/assets/images/common/version-close.svg";
import rightIcon from "@/assets/images/common/fanhui.svg";
import divergentIcon from "@/assets/images/common/divergent-animation.png";

// 发现本地游戏
const LocalGame: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { open = false, value = [] } = useSelector(
    (state: any) => state?.modalOpen?.localGameState
  ); // 发现本地扫描到的游戏弹窗
  const { appendGameToList } = useGamesInitialize();

  // 关闭弹窗
  const onCancel = () => {
    dispatch(setLocalGameState({ open: false, value: [] }));
  }

  return open ? (
    <div className="local-game-module">
      <div className="header">
        <div className="text">
          <span className="desicrpt">发现本地游戏，</span>
          <span
            className="check"
            onClick={() => {
              navigate("/myGames")
              onCancel();
              }}
            >
            去查看
            <img src={rightIcon} alt="" />
          </span>
        </div>
        <img className="close" src={closeIcon} alt="" onClick={onCancel} />
      </div>
      <div className="line" />
      {value?.length > 0 && 
        <div className="game-card">
          {value?.map((item: any) => {
            return (
              <div className="card-child" key={item?.id}>
                <img className="cover" src={item?.cover_img} alt="" />
                <div className="text-box">
                  <div className="name">{item?.name}</div>
                  <div className="en-name">
                    {item?.note ? item?.note : `${item?.name_en}`}
                  </div>
                </div>
                <img className="divergent" src={divergentIcon} alt="" onClick={(e) => {
                  e.stopPropagation();

                  if (localStorage.getItem("isAccelLoading") === "1") {
                    // 触发游戏在加速中提示
                    eventBus.emit("showModal", {
                      show: true,
                      type: "gamesAccelerating",
                    });

                    return;
                  }

                  const data = appendGameToList(item); // 添加到我的游戏
                  const optionParams =
                    data.filter((child: any) => item?.id === child?.id)?.[0] ||
                    {}; // 拿到这个添加操作后的数据

                  // 跳转到首页并触发自动加速autoAccelerate
                  navigate("/home", {
                    state: {
                      isNav: true,
                      data: {
                        ...optionParams,
                        router: "home",
                      },
                      autoAccelerate: true,
                    },
                  });

                  onCancel();
                }}/>
              </div>
            );
          })}
        </div>
      }
    </div>
  ) : null;
};

export default LocalGame;