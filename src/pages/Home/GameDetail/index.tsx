/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-25 11:15:26
 * @FilePath: \speed\src\pages\Home\GameDetail\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./style.scss";

import backGameIcon from "@/assets/images/common/back-game.svg";
import accelerateIcon from "@/assets/images/common/details-accelerate.svg";
import activateIcon from "@/assets/images/common/activate.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";

import BarChart from "@/containers/BarChart/index";
declare const CefWebInstance: any;
interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  description: string;
}

const game: Game = {
  id: 1,
  name: "原神",
  image:
    "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
  tags: ["二次元", "开放世界", "RPG"],
  description:
    "《原神》是由中国大陆游戏开发商miHoYo制作并发行的一款开放世界动作角色扮演游戏。",
};

// 柱形图数据示例
const data = [
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
  { label: "A", value: 100 },
  { label: "B", value: 200 },
  { label: "C", value: 300 },
];

const GameDetail: React.FC = () => {
  const navigate = useNavigate();

  const stopSpeed = () => {
    console.log("stop speed ----------------");
    CefWebInstance.call(
      "jsCallStopSpeed",
      { message: "jsCallStopSpeed" },
      (error: any, result1: any) => {
        console.log("stop111111111111111");
        console.log(error);
        console.log(result1);
        navigate("/home");
        localStorage.setItem("stopSpeed", "1");
      }
    );
  };

  const openGame = () => {
    console.log("opengame--------------------------");
    CefWebInstance.call(
      "jsCallStartGame",
      { message: "jsCallStartGame" },
      (error: any, result1: any) => {
        console.log("stop111111111111111");
        console.log(error);
        console.log(result1);
      }
    );
  };

  return (
    <div className="home-module-detail">
      <img className="back-icon" src={backGameIcon} alt="" />
      <img className="mask-back-icon" src={accelerateIcon} alt="" />
      <div className="cantainer">
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="game-detail">
          <div className="game-left">
            <img src={game.image} alt={game.name} />
            <h2>{game.name}</h2>
            <Button
              className="on-game game-btn"
              type="default"
              onClick={openGame}
            >
              <img src={activateIcon} alt="" />
              启动游戏
            </Button>
            <Button
              className="down-game game-btn"
              type="default"
              onClick={stopSpeed}
            >
              <img src={cessationIcon} alt="" />
              停止加速
            </Button>
          </div>
          <div className="game-right">
            <div className="info-switch info-common-style">
              <span>00:50:21 亚服-北京-A508376（电信）</span>
              <span>切换</span>
            </div>
            <div className="info-speed info-common-style">
              <div className="keep speed-common">
                实时延迟
                <div>
                  98<span> ms</span>
                </div>
              </div>
              <div className="speed-line" />
              <div className="keep speed-common">
                丢包率
                <div>
                  0<span> %</span>
                </div>
              </div>
            </div>
            <div className="appliances info-common-style">
              <div className="title">设备连接</div>
              <div className="content-box">
                <div className="icon-box">
                  <img src={laptopsIcon} alt="" />
                  <div>电脑</div>
                </div>

                <div className="line-box">
                  2ms
                  <div className="line" />
                </div>
                <div className="icon-box">
                  <img src={computingIcon} alt="" />
                  <div>路由器</div>
                </div>

                <div className="line-box">
                  2ms
                  <div className="line" />
                </div>
                <div className="icon-box">
                  <img src={computerIcon} alt="" />
                  <div>服务器</div>
                </div>
              </div>
            </div>
            <div className="tendencies info-common-style">
              <div className="title">加速趋势</div>
              <BarChart data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
