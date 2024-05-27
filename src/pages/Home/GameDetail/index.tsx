/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-27 20:30:19
 * @FilePath: \speed\src\pages\Home\GameDetail\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import "./style.scss";
import ActivationModal from "@/containers/activation-mode";
import backGameIcon from "@/assets/images/common/back-game.svg";
import accelerateIcon from "@/assets/images/common/details-accelerate.svg";
import activateIcon from "@/assets/images/common/activate.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";
import detailsCustomIcon from "@/assets/images/common/details-custom.svg";

import BarChart from "@/containers/BarChart/index";
import RegionNodeSelector from "@/containers/RegionNodeSelector/index";
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

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isModalShow, setIsModalShow] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(0); // 当前加速游戏数据

  const [count, setCount] = useState(0);

  const showModalActive = () => {
    setIsOpen(true);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const closeModal = () => {
    console.log(1111111111);
    setIsOpen(false);
  };

  const stopSpeed = () => {
    console.log("停止加速---------------");
    const requestData = JSON.stringify({
      method: "NativeApi_StopProxy",
      params: null,
    });

    let game_arr = getMyGames();

    game_arr = game_arr.map((item: any) => ({
      ...item,
      is_accelerate: false,
    }));

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_arr));

    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("停止加速----------:", response);
        navigate("/home");
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("加速失败 failed:", errorMessage);
      },
    });
  };

  useEffect(() => {
    let arr = getMyGames();
    let details_arr = arr.filter((item: any) => item?.is_accelerate);
    const speedIp = localStorage.getItem("speedIp");
    const speedInfoString = localStorage.getItem("speedInfo");
    const speedInfo = speedInfoString ? JSON.parse(speedInfoString) : null;
    console.log("我的游戏总数据", arr);
    console.log("当前加速游戏数据", details_arr);
    console.log("speedInfo全部信息", speedInfo);
    // @ts-ignore

    // 每隔 10 秒增加计数器的值
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
      console.log("ip---------------------------", speedIp);
      const requestData = JSON.stringify({
        method: "NativeApi_GetIpDelayByICMP",
        params: { ip: speedIp },
      });
      (window as any).cefQuery({
        request: requestData,
        onSuccess: (response: any) => {
          console.log("详情丢包信息=========================:", response);
          const jsonResponse = JSON.parse(response).delay; //{"delay":32(这个是毫秒,9999代表超时与丢包)}
          console.log(
            "详情丢包信息jsonResponse=========================:",
            jsonResponse
          );
          setLostBag(jsonResponse);

          setDetailData(details_arr?.[0] || {});
        },
        onFailure: (errorCode: any, errorMessage: any) => {
          console.error("Query failed:", errorMessage);
        },
      });
    }, 10000);
    

    // 返回一个清理函数，在组件卸载时清除定时器
    return () => clearInterval(interval);
  }, [count]);

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
            <div className="game-text">{detailData?.name}</div>
            <Button
              className="on-game game-btn"
              type="default"
              onClick={showModalActive}
            >
              <img src={activateIcon} width={18} height={18} alt="" />
              启动游戏
              <div className="line" />
              <img src={detailsCustomIcon} width={18} height={18} alt="" />
            </Button>
            <Button
              className="down-game game-btn"
              type="default"
              onClick={stopSpeed}
            >
              <img src={cessationIcon} width={18} height={18} alt="" />
              00:21:22
            </Button>
          </div>
          <div className="game-right">
            <div className="info-switch info-common-style">
              <span>00:50:21 亚服-北京-A508376（电信）</span>
              <span onClick={showModal}>切换</span>
            </div>
            <div className="info-speed info-common-style">
              <div className="keep speed-common">
                实时延迟
                <div>
                  {lostBag}
                  <span> ms</span>
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
                  <div className="line">
                    <div className="animate-line" />
                  </div>
                </div>
                <div className="icon-box">
                  <img src={computingIcon} alt="" />
                  <div>路由器</div>
                </div>

                <div className="line-box">
                  2ms
                  <div className="line">
                    <div className="animate-line" />
                  </div>
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
            <RegionNodeSelector visible={isModalVisible} onCancel={hideModal} />
            {isOpen && (
              <ActivationModal gameId={detailData.id} onClose={closeModal} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
