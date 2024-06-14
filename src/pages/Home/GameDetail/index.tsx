/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-14 19:10:09
 * @FilePath: \speed\src\pages\Home\GameDetail\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDelay } from "@/redux/actions/auth";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import useCefQuery from "@/hooks/useCefQuery";

import "./style.scss";
import BarChart from "@/containers/BarChart/index";
import RegionNodeSelector from "@/containers/RegionNodeSelector/index";
import ActivationModal from "@/containers/activation-mode";
import BreakConfirmModal from "@/containers/break-confirm";

import backGameIcon from "@/assets/images/common/back-game.svg";
import accelerateIcon from "@/assets/images/common/details-accelerate.svg";
import activateIcon from "@/assets/images/common/activate.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";
import detailsCustomIcon from "@/assets/images/common/details-custom.svg";

const GameDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const sendMessageToBackend = useCefQuery();
  const historyContext: any = useHistoryContext();
  const {
    identifyAccelerationData,
    chooseDefaultNode,
    removeGameList,
    forceStopAcceleration,
  } = useGamesInitialize();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [stopModalOpen, setStopModalOpen] = useState(false);

  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(); // 实时延迟
  const [packetLoss, setPacketLoss] = useState<any>(); // 丢包率

  const [regionInfo, setRegionInfo] = useState<any>(); // 当前加速区服

  const [chartData, setChartData] = useState<any>([]); // 柱形图数据示例

  // 使用 useMemo 确保只有 data 变化时才会重新计算
  const memoizedData = useMemo(() => chartData, [chartData]);

  const showModalActive = () => {
    setIsOpen(true);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  // 停止加速
  const stopSpeed = () => {
    setStopModalOpen(false);
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        historyContext?.accelerateTime?.stopTimer();
        console.log(window, window as any);

        (window as any).stopDelayTimer();
        removeGameList("initialize"); // 更新我的游戏
        navigate("/home");
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  function formatTime(seconds: any) {
    // 计算小时数
    const hours = Math.floor(seconds / 3600);
    // 计算剩余的分钟数
    const minutes = Math.floor((seconds % 3600) / 60);
    // 计算剩余的秒数
    const remainingSeconds = seconds % 60;

    // 将小时、分钟和秒数格式化为两位数
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    // 拼接成 HH:MM:SS 格式
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  function generateDataEvery10Seconds(value: any) {
    const result = [];
    const currentTime = Date.now(); // 获取当前时间的时间戳（毫秒）
    const startTime = currentTime - 3 * 60 * 1000; // 获取 3 分钟前的时间戳

    // 以 10 秒为间隔生成数据对象
    for (let time = startTime; time <= currentTime; time += 10 * 1000) {
      const data = {
        timestamp: time, // 时间戳
        value: 2, // 示例数据，可以根据需要修改
      };
      result.push(data);
    }

    result[result.length - 1].value = value;

    return result;
  }

  useEffect(() => {
    let ip = localStorage.getItem("speedIp"); // 存储的ip
    let find_accel = identifyAccelerationData()?.[1] || {}; // 当前加速数据
    let select_region = chooseDefaultNode(find_accel); // 当前选择区服

    historyContext?.accelerateTime?.startTimer();

    // 查看加速详情，获取延迟
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_GetIpDelayByICMP",
        params: { ip },
      }),
      (response: any) => {
        console.log("Success response from 详情丢包信息:", response);

        //{"delay":32(这个是毫秒,9999代表超时与丢包)}
        const delay = JSON.parse(response)?.delay;
        const lost_bag = delay < 2 ? 2 : delay;
        const chart_list = generateDataEvery10Seconds(lost_bag);

        setChartData(chart_list); // 更新图表
        setLostBag(lost_bag); // 更新延迟数
        setPacketLoss(delay === 9999 ? 25 : 0); // 更新丢包率
        setDetailData(find_accel);
        setRegionInfo(select_region);

        dispatch(updateDelay(lost_bag)); // 更新 redux 延迟数
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 详情丢包信息:", errorCode);
      }
    );
  }, []);

  // 每隔 10 秒增加计数器的值
  useEffect(() => {
    const interval = setInterval(() => {
      let ip = localStorage.getItem("speedIp"); // 存储的ip

      // 查看加速详情，获取延迟
      sendMessageToBackend(
        JSON.stringify({
          method: "NativeApi_GetIpDelayByICMP",
          params: { ip },
        }),
        (response: any) => {
          console.log("Success response from 详情丢包信息:", response);

          //{"delay":32(这个是毫秒,9999代表超时与丢包)}
          const delay = JSON.parse(response)?.delay;
          const lost_bag = delay < 2 ? 2 : delay;
          // 10秒比较一次是否到期，到期后停止加速
          forceStopAcceleration(accountInfo, stopSpeed);

          setChartData((chart: any) => {
            let chart_list = [...chart];

            chart_list.shift();

            let lastElement = chart_list[chart_list.length - 1];

            let time = lastElement?.timestamp
              ? lastElement?.timestamp + 10000
              : new Date().getTime();
            let newData = {
              timestamp: time,
              value: lost_bag,
            };

            chart_list.push(newData);

            return chart_list;
          }); // 更新图表
          setLostBag(lost_bag); // 更新延迟数
          setPacketLoss(delay === 9999 ? 25 : 0); // 更新丢包率

          dispatch(updateDelay(lost_bag)); // 更新 redux 延迟数
        },
        (errorCode: any, errorMessage: any) => {
          console.error("Failure response from 详情丢包信息:", errorCode);
        }
      );
    }, 10000);

    (window as any).stopDelayTimer = () => {
      clearInterval(interval);
    };

    // 返回一个清理函数，在组件卸载时清除定时器
    // return () => clearInterval(interval);
  }, []);

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
              onClick={() => setStopModalOpen(true)}
            >
              <img src={cessationIcon} width={18} height={18} alt="" />
              {formatTime(historyContext?.accelerateTime?.count)}
            </Button>
          </div>
          <div className="game-right">
            <div className="info-switch info-common-style" onClick={showModal}>
              <span>{regionInfo?.region}</span>
              <span>切换</span>
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
                  {packetLoss}
                  <span> %</span>
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
                  {1}ms
                  <div className="line">
                    <div className="animate-line" />
                  </div>
                </div>
                <div className="icon-box">
                  <img src={computingIcon} alt="" />
                  <div>路由器</div>
                </div>

                <div className="line-box">
                  {lostBag - 1}ms
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
              <BarChart data={memoizedData} />
            </div>
            <RegionNodeSelector
              visible={isModalVisible}
              detailData={detailData}
              onCancel={hideModal}
              onSelect={(e) => setRegionInfo(e)}
            />
            {isOpen && (
              <ActivationModal
                gameId={detailData.id}
                onClose={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
      {stopModalOpen ? (
        <BreakConfirmModal
          type={"stopAccelerate"}
          accelOpen={stopModalOpen}
          setAccelOpen={setStopModalOpen}
          onConfirm={stopSpeed}
        />
      ) : null}
    </div>
  );
};

export default GameDetail;
