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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDelay, setAccelerateChart } from "@/redux/actions/auth";
import { setStartPathOpen } from "@/redux/actions/modal-open";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";

import "./style.scss";
import tracking from "@/common/tracking";
import BarChart from "@/containers/BarChart/index";
import RegionNodeSelector from "@/containers/region-node";
import ActivationModal from "@/containers/activation-mode";
import BreakConfirmModal from "@/containers/break-confirm";

import fanhuiIcon from "@/assets/images/common/fanhui.svg";
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
import { store } from "@/redux/store";

const GameDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 控制启动路径弹窗的开关
  const startPathOpen = useSelector(
    (state: any) => state?.modalOpen?.startPathOpen
  );
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const iniliteChart = useSelector((state: any) => state.auth.accelerateChart); // 存储的游戏详情图表数据

  const historyContext: any = useHistoryContext();
  const {
    identifyAccelerationData,
    removeGameList,
    forceStopAcceleration,
    checkShelves,
  } = useGamesInitialize();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [delayOpen, setDelayOpen] = useState(false); // 延迟弹窗
  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(1); // 实时延迟
  const [packetLoss, setPacketLoss] = useState<any>(0); // 丢包率

  const [regionNode, setRegionNode] = useState("智能匹配-智能节点");
  const [chartData, setChartData] = useState<any>([]); // 柱形图数据示例

  // 使用 useMemo 确保只有 data 变化时才会重新计算
  const memoizedData = useMemo(() => chartData, [chartData]);

  const iniliteDomName = (data: any = {}) => {
    const { region = {}, node = {}} = data;
    const fu = region?.fu;

    return (fu ? fu + "-" : "") + region?.qu + "-" + (node?.name ?? "");
  };

  // 当前选择的区服，节点
  const handleSelectServer = (serverNode: any) => {
    const { selectRegion = {}, nodeHistory = [] } = serverNode; // 解构选中区服 节点列表
    const node = nodeHistory.filter((item: any) => item?.is_select)?.[0] || {}; // 选中节点

    return {
      region: selectRegion,
      node,
    };
  };

  const showModal = async () => {
    if (await checkShelves(detailData)) return; // 判断是否当前游戏下架
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

  // 处理时间格式函数
  const formatTime = (seconds: any) => {
    const hours = Math.floor(seconds / 3600); // 计算小时数
    const minutes = Math.floor((seconds % 3600) / 60); // 计算剩余的分钟数
    const remainingSeconds = seconds % 60; // 计算剩余的秒数

    // 将小时、分钟和秒数格式化为两位数
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    // 拼接成 HH:MM:SS 格式
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  // 生成图表数据函数
  const generateChart = (value: any, packet: any) => {
    const chartList = iniliteChart; // 图表数据
    const currentTime = Date.now(); // 获取当前时间的时间戳（毫秒）
    
    // 如果图表数据为0个则代表是第一次生成，则调用此逻辑生成3分钟的随机数据
    if (iniliteChart?.length === 0) {
      const startTime = currentTime - 180005; // 获取 3分05秒 前的时间戳

      // 以 5 秒为间隔生成数据对象 生成3分钟随机数据
      for (let time = startTime; time <= currentTime - 5; time += 5 * 1000) {
        const data: any = {
          timestamp: time, // 时间戳
          value: 0, // 示例数据，可以根据需要修改
        };
        iniliteChart.push(data);
      }
    }

    iniliteChart.shift(); // 删除第一个数据
    iniliteChart.push({
      // 添加当前数据
      timestamp: currentTime,
      value,
      packet,
    });
    
    dispatch(setAccelerateChart(iniliteChart));
    return iniliteChart;
  };

  // 生成丢包率函数 data = 数组
  const generatePacket = (data: any) => {
    let sum = 0; // 丢包率和
    let count = 0; // 几个丢包率

    data.forEach((item: any) => {
      if (item.hasOwnProperty("packet")) {
        sum += item.packet;
        count++;
      }
    });

    const averagePacket = Math.floor(sum / count); // 评价丢包率
    
    return averagePacket || 0;
  };

  // 生成游戏可执行平台icon
  const findMappingIcon = (data: any) => {
    let platform = data?.pc_platform || []; // 同步加速的游戏，平台

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

        return child;
      });
    }

    return resultData;
  };

  const startDelayTmer = (callback: any, value: any) => {
    // 定义一个内部变量来存储定时器的标识符
    let timerId: any = null;

    // 启动定时器
    timerId = setInterval(() => {
      // 执行回调函数
      callback(value);
    }, 5000);

    // 返回一个函数，该函数用于停止定时器
    return () => {
      clearInterval(timerId);
      localStorage.removeItem("isStartTimer"); // 删除存储是否开启5秒计时器
    };
  };

  // 获取客户端延迟
  const fetchAddrDelay = (node: any) => {
    try {
      new Promise<void>((resolve, reject) => {
        (window as any).NativeApi_AsynchronousRequest(
          "NativeApi_GetAddrDelay",
          JSON.stringify({
            params: { addr: node?.addr, server: node?.server },
          }),
          (response: any) => {
            console.log("详情丢包信息：", response);
            let delay = JSON.parse(response)?.delay; // 返回信息 delay 毫秒,9999代表超时与丢包

            if (!response || delay >= 9999) {
              setDelayOpen(true); // 延迟过高提示
            }

            // 如果用户是vip，会进行vip到期判断处理
            if (accountInfo?.userInfo?.is_vip) {
              forceStopAcceleration(accountInfo, stopSpeed);
            }

            delay = delay < 2 ? 2 : delay; // 对延迟小于2进行处理，避免展示问题

            const chart = generateChart(delay, delay === 9999 ? 100 : 0); // 图表展示数据
            const packetLoss = generatePacket(chart); // 丢包率
            
            setChartData([...chart]);
            setLostBag(delay);
            setPacketLoss(packetLoss);
            dispatch(updateDelay(delay));
          }
        );
      });
    } catch (error) {
      console.log("游戏详情获取客户端延迟方法错误：", error);
      setDelayOpen(true);
    }
  };

  useEffect(() => {
    const iniliteFun = () => {
      const accel = identifyAccelerationData()?.[1] || {}; // 当前加速数据
      const server = handleSelectServer(accel?.serverNode); // 存储的区服节点信息

      if ((window as any).stopDelayTimer) {
        (window as any).stopDelayTimer(); // 进入游戏先进行清除旧的计时器
      }

      fetchAddrDelay(server?.node); // 调用客户端获取延迟方法
      setDetailData(accel); // 更新游戏详情信息
      historyContext?.accelerateTime?.startTimer(); // 调用详情加速计时器
      setRegionNode(iniliteDomName(server));

      // 启动定时器，并返回一个可以用来停止定时器的函数
      const stopTimer = startDelayTmer(fetchAddrDelay, server?.node);

      (window as any).stopDelayTimer = () => {
        stopTimer(); // 在 window 挂载停止计时器方法
      };
    };

    iniliteFun();
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
        <img
          src={fanhuiIcon}
          alt=""
          className="back"
          onClick={() => navigate("/home")}
        />
        <div className="game-detail">
          <div className="game-left">
            <div className="game-text">{detailData?.name}</div>
            {detailData?.pc_platform?.length > 0 && (
              <div className="platfrom">
                <div className="text">已同步加速</div>
                <div className="icon-box">
                  {findMappingIcon(detailData)?.length > 0 &&
                    findMappingIcon(detailData)?.map((item: any) => {
                      return <img key={item?.id} src={item?.icon} alt="" />;
                    })}
                </div>
              </div>
            )}
            <div className="game-btn">
              <Button
                className="Launching on-game"
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
                    dispatch(setStartPathOpen(true)); // 打开启动路径弹窗
                  }
                }}
              >
                <img src={activateIcon} width={18} height={18} alt="" />
                <span>启动游戏</span>
              </Button>

              <Button
                className="path"
                type="default"
                onClick={() => dispatch(setStartPathOpen(true))}
              >
                <div className="line" />
                <img src={detailsCustomIcon} width={18} height={18} alt="" />
              </Button>
            </div>

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
              <span>{regionNode}</span>
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
      <ActivationModal options={detailData} />
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
