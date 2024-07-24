/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-24 14:51:17
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
import tracking from "@/common/tracking";
import "./style.scss";
import BarChart from "@/containers/BarChart/index";
import RegionNodeSelector from "@/containers/RegionNodeSelector";
import ActivationModal from "@/containers/activation-mode";
import BreakConfirmModal from "@/containers/break-confirm";

import accelerateIcon from "@/assets/images/common/details-accelerate.svg";
import activateIcon from "@/assets/images/common/activate.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";
import detailsCustomIcon from "@/assets/images/common/details-custom.svg";
import backGameIcon from "@/assets/images/common/back-game.svg";
import steamIcon from "@/assets/images/common/steam@2x.png";
import rockstarIcon from "@/assets/images/common/rockstar@2x.png";
import battleIcon from "@/assets/images/common/Battlenet@2x.png";
import eaIcon from "@/assets/images/common/EA_App_2022_icon@2x.png";
import epicIcon from "@/assets/images/common/Epic@2x.png";
import faceitIcon from "@/assets/images/common/faceit@2x.png";
import microsoftIcon from "@/assets/images/common/Microsoft store@2x.png";
import oculusIcon from "@/assets/images/common/Oculus@2x.png";
import garenaIcon from "@/assets/images/common/Garena@2x.png";
import galaxyIcon from "@/assets/images/common/GOG Galaxy@2x.png";
import primeGamIcon from "@/assets/images/common/Prime Gaming@2x.png";

const GameDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const historyContext: any = useHistoryContext();
  const { identifyAccelerationData, removeGameList, forceStopAcceleration } =
    useGamesInitialize();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // 启动游戏平台弹窗

  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [delayOpen, setDelayOpen] = useState(false); // 延迟弹窗
  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(); // 实时延迟
  const [packetLoss, setPacketLoss] = useState<any>(); // 丢包率

  const [regionInfo, setRegionInfo] = useState<any>(); // 当前加速区服
  const [chartData, setChartData] = useState<any>([]); // 柱形图数据示例

  // 使用 useMemo 确保只有 data 变化时才会重新计算
  const memoizedData = useMemo(() => chartData, [chartData]);

  const domName = (data = regionInfo) => {
    let fu = data?.select_region?.fu ? data?.select_region?.fu + "-" : "";
    let dom = detailData?.dom_info?.select_dom?.name || "";

    return fu + data?.select_region?.qu + "-" + dom;
  };

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
  const stopSpeed = async () => {
    setStopModalOpen(false);
    let jsonString = "";

    const userToken = localStorage.getItem("token");
    const jsKey = localStorage.getItem("StartKey");

    if (jsKey) {
      jsonString = JSON.stringify({
        params: {
          user_token: userToken ? JSON.parse(userToken) : "",
          js_key: jsKey,
        },
      });
    }
    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_StopProxy",
      jsonString,
      function (response: any) {
        console.log("Success response from 停止加速:", response);
        tracking.trackBoostDisconnectManual("手动停止加速");
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        removeGameList("initialize"); // 更新我的游戏
        navigate("/home");
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

  const findMappingIcon = (data: any) => {
    const platform = data?.pc_platform || [];
    const iconMap: any = {
      "1": steamIcon,
      "2": garenaIcon,
      "3": laptopsIcon,
      "4": epicIcon,
      "5": microsoftIcon,
      "6": eaIcon,
      "7": faceitIcon,
      "8": battleIcon,
      "9": oculusIcon,
      "10": rockstarIcon,
      "11": galaxyIcon,
      "12": primeGamIcon,
    };
    let resultData: any = [];

    if (Array.isArray(platform) && platform?.length > 0) {
      resultData = platform.map((child: any) => {
        if (Object.keys(iconMap).includes(String(child))) {
          return {
            id: child,
            icon: iconMap?.[child],
          };
        }
      });
    }

    return resultData;
  };

  useEffect(() => {
    let find_accel = identifyAccelerationData()?.[1] || {}; // 当前加速数据
    let select_region = find_accel?.region; // 当前选择区服
    let ip = find_accel?.dom_info?.select_dom?.ip; // 存储的ip
    console.log("ip", ip);

    historyContext?.accelerateTime?.startTimer();

    const jsonString = JSON.stringify({
      params: { ip },
    });

    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_GetIpDelayByICMP",
      jsonString,
      function (response: any) {
        if (!response) {
          console.error("Failure response from 详情丢包信息:");
          setDelayOpen(true);
        }
        console.log("Success response from 详情丢包信息:", response);

        //{"delay":32(这个是毫秒,9999代表超时与丢包)}
        const delay = JSON.parse(response)?.delay;
        const lost_bag = delay < 2 ? 2 : delay;
        const chart_list = generateDataEvery10Seconds(lost_bag);

        if (delay === 9999) {
          setDelayOpen(true);
        }

        setChartData(chart_list); // 更新图表
        setLostBag(lost_bag); // 更新延迟数
        setPacketLoss(delay === 9999 ? 25 : 0); // 更新丢包率
        setDetailData(find_accel);
        setRegionInfo(select_region);

        dispatch(updateDelay(lost_bag)); // 更新 redux 延迟数
      }
    );
  }, []);

  // 每隔 10 秒增加计数器的值
  useEffect(() => {
    const interval = setInterval(() => {
      let find_accel = identifyAccelerationData()?.[1] || {}; // 当前加速数据
      let ip = find_accel?.dom_info?.select_dom?.ip; // 存储的ip
      console.log("ip", ip);

      const jsonString = JSON.stringify({
        params: { ip },
      });

      (window as any).NativeApi_AsynchronousRequest(
        "NativeApi_GetIpDelayByICMP",
        jsonString,
        function (response: any) {
          console.log("Success response from 详情丢包信息:", response);

          //{"delay":32(这个是毫秒,9999代表超时与丢包)}
          const delay = JSON.parse(response)?.delay;
          const lost_bag = delay < 2 ? 2 : delay;
          // 10秒比较一次是否到期，到期后停止加速

          if (accountInfo?.userInfo?.is_vip)
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
        }
      );
    }, 10000);

    (window as any).stopDelayTimer = () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="home-module-detail">
      <img
        className="back-icon"
        src={`${
          detailData?.background_img
            ? "https://cdn.accessorx.com/" + detailData?.background_img
            : backGameIcon
        }`}
        alt=""
      />
      <img className="mask-back-icon" src={accelerateIcon} alt="" />
      <div className="cantainer">
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="game-detail">
          <div className="game-left">
            <div className="game-text">{detailData?.name}</div>
            <div className="platfrom">
              <div className="text">已同步加速</div>
              <div className="icon-box">
                {findMappingIcon(detailData)?.length > 0 &&
                  findMappingIcon(detailData)?.map((item: any) => {
                    return <img key={item?.id} src={item?.icon} alt="" />;
                  })}
              </div>
            </div>
            <Button
              className="on-game game-btn game-out"
              type="default"
              onClick={(e) => {
                e.stopPropagation();
                const method = detailData?.activation_method;

                if (method) {
                  new Promise((resolve, reject) => {
                    (window as any).NativeApi_AsynchronousRequest(
                      "NativeApi_StartProcess",
                      JSON.stringify({
                        params: { path: method?.filePath },
                      }),
                      (response: string) => {
                        const parsedResponse = JSON.parse(response);
                        if (parsedResponse.success === 1) {
                          resolve(parsedResponse);
                        } else {
                          reject(parsedResponse);
                        }
                      }
                    );
                  });
                } else {
                  showModalActive();
                }
              }}
            >
              <img
                src={activateIcon}
                width={18}
                height={18}
                alt=""/>
              <span>
                启动游戏
              </span>
              <div className="line" />
            </Button>

            <Button
              className="on-game game-btn game-in"
              type="default"
              onClick={showModalActive}
            >
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
              <span>{domName(regionInfo)}</span>
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
          </div>
        </div>
      </div>
      {isModalVisible ? (
        <RegionNodeSelector
          open={isModalVisible}
          options={detailData}
          onCancel={hideModal}
          stopSpeed={stopSpeed}
        />
      ) : null}
      {isOpen && (
        <ActivationModal
          open={isOpen}
          options={detailData}
          notice={(e) => setDetailData(e)}
          onClose={() => setIsOpen(false)}
        />
      )}
      {stopModalOpen ? (
        <BreakConfirmModal
          type={"stopAccelerate"}
          accelOpen={stopModalOpen}
          setAccelOpen={setStopModalOpen}
          onConfirm={stopSpeed}
        />
      ) : null}
      {delayOpen ? (
        <BreakConfirmModal
          type={"delayTooHigh"}
          accelOpen={delayOpen}
          setAccelOpen={setDelayOpen}
          onConfirm={() => setIsModalVisible(true)}
        />
      ) : null}
    </div>
  );
};

export default GameDetail;
