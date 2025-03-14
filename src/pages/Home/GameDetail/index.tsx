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
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDelay, setAccelerateChart } from "@/redux/actions/auth";
import { setStartPathOpen } from "@/redux/actions/modal-open";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";

import "./style.scss";
import tracking from "@/common/tracking";
import LineChart from "./chart/line-chart";
import RegionNodeSelector from "@/containers/region-node";
import ActivationModal from "@/containers/activation-mode";
import BreakConfirmModal from "@/containers/break-confirm";
import BaseTooltip from "@/components/base-tooltip";

import fanhuiIcon from "@/assets/images/common/fanhui.svg";
import accelerateIcon from "@/assets/images/common/details-accelerate.webp";
import activateIcon from "@/assets/images/common/activate.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";
import computerIcon from "@/assets/images/common/computer.svg";
import computingIcon from "@/assets/images/common/computing.svg";
import laptopsIcon from "@/assets/images/common/laptops.svg";
import uplayIcon from "@/assets/images/common/laptops@2x.png";
import detailsCustomIcon from "@/assets/images/common/details-custom.svg";
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
import toggleIcon from "@/assets/images/home/toggle.png";
import iniliteBackGIcon from "@/assets/images/common/inilite-img.jpg";
import appliancesGit from "@/assets/images/common/appliances.gif";

const iniliteDelay = { 
  time: 0, // 时间
  original_delay: 65, // 原始延迟
  optimized_delay: 65, // 优化延迟
  network: "未知", // 本地网络类型
};

const GameDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const iniliteChart = useSelector((state: any) => state.auth.accelerateChart); // 存储的游戏详情图表数据
  
  const historyContext: any = useHistoryContext();
  const {
    identifyAccelerationData,
    removeGameList,
  } = useGamesInitialize();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stopModalOpen, setStopModalOpen] = useState(false);

  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(1); // 实时延迟
  const [packetLoss, setPacketLoss] = useState<any>(0); // 丢包率

  const [regionNode, setRegionNode] = useState("智能匹配-智能节点");
  const [chartData, setChartData] = useState<any>([]); // 柱形图数据示例

  const [startLoading, setStartLoading] = useState(false); // 是否加载启动游戏中

  // 使用 useMemo 确保只有 data 变化时才会重新计算
  const memoizedData = useMemo(() => chartData, [chartData]);
  const gameErroricon = process.env.REACT_APP_IMAGE_GAME_ERROR;

  // 初始化展示区服节点函数
  const iniliteDomName = (data: any = {}) => {
    const { region = {}, node = {} } = data;
    const fu = region?.fu;

    return (fu ? fu + "-" : "") + region?.qu + "-" + (node?.name ?? "");
  };

  // 当前选择的区服，节点
  const handleSelectServer = (serverNode: any = {}) => {
    const { selectRegion = {}, nodeHistory = [] } = serverNode; // 解构选中区服 节点列表
    const node = nodeHistory.filter((item: any) => item?.is_select)?.[0] || {}; // 选中节点

    return {
      region: selectRegion,
      node,
    };
  };

  // 打开区服节点弹窗
  const showModal = async () => {
    let data = { ...detailData };
    
    setDetailData(data);
    setIsModalVisible(true);
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
        console.log(historyContext?.accelerateTime?.count, historyContext);
        
        tracking.trackBoostDisconnectManual();
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        if ((window as any).stopkeepAliveTimer) {
          (window as any).stopkeepAliveTimer();
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
    const currentTime = Date.now(); // 获取当前时间的时间戳（毫秒）
    const {
      optimized_delay, // 优化延迟
      original_delay, // 原始延迟
    } = value;

    if (optimized_delay !== 9999 && original_delay !== 9999) {
      localStorage.setItem("correctDelay", JSON.stringify(value));
    } else {
      const localDelay = localStorage.getItem("correctDelay"); // 读取缓存
      const correctDelay = localDelay ? JSON.parse(localDelay) : {}; // 解构缓存

      value = correctDelay;
    }
    
    // 如果图表数据为0个则代表是第一次生成，则调用此逻辑生成3分钟的随机数据
    if (iniliteChart?.length === 0) {
      const startTime = currentTime - 5000; // 获取 3分05秒 前的时间戳

      // 以 5 秒为间隔生成数据对象 生成3分钟随机数据
      for (let time = startTime; time <= currentTime - 5; time += 5 * 1000) {
        const data: any = {
          ...value, // 默认数据
          time, // 时间戳
          delay: optimized_delay,
        };

        iniliteChart.push(data);
      }
    }

    if (iniliteChart?.length > 36) {
      iniliteChart.shift(); // 删除第一个数据
    }
    
    iniliteChart.push({
      // 添加当前数据
      ...value,
      time: currentTime,
      packet,
      delay: packet === 100 ? 9999 : 2,
    });
    
    // 更新 返回 图表数据
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
      "1": {
        icon: steamIcon,
        name: "Steam",
      },
      "2": {
        icon: garenaIcon,
        name: "Garena",
      },
      "3": {
        icon: uplayIcon,
        name: "Uplay",
      },
      "4": {
        icon: epicIcon,
        name: "Epic Games",
      },
      "5": {
        icon: microsoftIcon,
        name: "Microsoft Store",
      },
      "6": {
        icon: eaIcon,
        name: "EA app",
      },
      "7": {
        icon: faceitIcon,
        name: "FACEIT",
      },
      "8": {
        icon: battleIcon,
        name: "Battle.net",
      },
      "9": {
        icon: oculusIcon,
        name: "Oculus",
      },
      "10": {
        icon: rockstarIcon,
        name: "Rockstar games",
      },
      "11": {
        icon: galaxyIcon,
        name: "GOG Galaxy",
      },
      "12": {
        icon: primeGamIcon,
        name: "Prime Gaming",
      },
    };
    let resultData: any = [];

    if (Array.isArray(platform) && platform?.length > 0) {
      resultData = platform.map((child: any) => {
        if (Object.keys(iconMap).includes(String(child))) {
          return {
            ...iconMap?.[child],
            id: child,
          };
        }

        return child;
      });
    }

    return resultData;
  };

  // 定义计时器 并且返回清除计时器
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
      localStorage.removeItem("correctDelay"); // 清除正常情况下存储的延迟数据
      clearInterval(timerId);
      dispatch(setAccelerateChart([])); // 还原加速图表存储的图表数据
    };
  };

  // 启动游戏或者打开启动游戏路径
  const startProgress = (data: any, start: any, event?: any) => {
    let storage: any = localStorage.getItem("startAssemble"); // 读取游戏启动路径信息
    let assemble = storage ? JSON.parse(storage) : []; // 解析存储游戏id 平台列表
    let hitGame = assemble.find((item: any) => item?.id === data?.id); // 当前游戏的启动信息

    // 如果是手动点击启动，防止捕获
    if (event) {
      event.stopPropagation();
    }

    // 当前游戏是存储过游戏路径，且启动方式为自动启动
    // 游戏为初始自动启动 或者 手动触发
    if (hitGame?.start === start || (hitGame && start === "human" && hitGame?.path)) {
      new Promise((resolve, reject) => {
        (window as any).NativeApi_AsynchronousRequest(
          "NativeApi_StartProcess",
          JSON.stringify({
            params: { path: hitGame?.path },
          }),
          (response: string) => {
            const res = JSON.parse(response);

            if (res?.success === 1) {
              setStartLoading(true);
              setTimeout(() => {
                setStartLoading(false);
              }, 5000);
            }
          }
        );
      });

      return;
    } else if (event) {
      dispatch(setStartPathOpen(true)); // 打开启动路径弹窗
    }
  };

  // 读取对象值，防止旧数据是字符串值产生错误
  const getStorageObject = () => {
    const storageValue = localStorage.getItem("correctDelay");

    if (
      !storageValue ||
      storageValue === "undefined" ||
      storageValue === "null"
    ) {
      return iniliteDelay;
    }

    try {
      const parsed = JSON.parse(storageValue);
      return typeof parsed === "object" && parsed !== null
        ? parsed
        : iniliteDelay;
    } catch (e) {
      return iniliteDelay;
    }
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
            // console.log("详情丢包信息：", response);
            // 返回信息 delay 毫秒，9999代表超时与丢包
            let random = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
            let res_json = JSON.parse(response);
            let optimized_delay = res_json?.delay; // 优化延迟
            let original_delay = res_json?.delay + random; // 原始延迟
            let network = res_json?.adapter; // 本地网络类型

            // 对延迟小于2进行处理，避免展示问题
            optimized_delay = optimized_delay < 2 ? 2 : optimized_delay; // 优化延迟
            original_delay = original_delay < 2 ? 2 : original_delay; // 原始延迟

            let correctDelay = getStorageObject(); // 读取缓存

            // 对延迟等于9999进行处理，避免展示问题，并且只对设备连接，实时延迟，图表进行处理，丢包率不进行处理
            const chartDelay =
              optimized_delay === 9999 || original_delay === 9999
                ? correctDelay
                : {
                    optimized_delay,
                    original_delay,
                    network,
                  };
            const realDelay =
              chartDelay?.optimized_delay < 2 ? 2 : chartDelay?.optimized_delay; // 实时优化延迟

            const chart = generateChart(
              { ...chartDelay, delay: optimized_delay },
              optimized_delay === 9999 ? 100 : 0
            ); // 图表展示数据
            const packetLoss = generatePacket(chart); // 丢包率

            setChartData([...chart]);
            setLostBag(realDelay);
            setPacketLoss(packetLoss);
            dispatch(updateDelay(realDelay));
          }
        );
      });
    } catch (error) {
      console.log("游戏详情获取客户端延迟方法错误：", error);
    }
  };

  useEffect(() => {
    const iniliteFun = () => {
      const accel = identifyAccelerationData()?.[1] || {}; // 当前加速数据
      const server = handleSelectServer(accel?.serverNode); // 存储的区服节点信息

      // 如果计时器已经存在，则代表已经加速游戏
      if ((window as any).stopDelayTimer) {
        (window as any).stopDelayTimer(); // 进入游戏先进行清除旧的计时器
      }

      // 在未加速游戏时进行初始化是否启动游戏
      // 通过标记 fromRefresh 来判断是否是刷新当前页面，避免刷新导致自动启动游戏触发
      if (location?.state?.fromRefresh) {
        startProgress(accel, "auto");
      }

      fetchAddrDelay(server?.node); // 调用客户端获取延迟方法
      setDetailData({ ...accel, track: "detailPage" }); // 更新游戏详情信息
      historyContext?.accelerateTime?.startTimer(); // 调用详情加速计时器
      setRegionNode(iniliteDomName(server)); // 更新区服节点展示

      // 启动定时器，并返回一个可以用来停止定时器的函数
      const stopTimer = startDelayTmer(fetchAddrDelay, server?.node);

      (window as any).stopDelayTimer = () => {
        stopTimer(); // 在 window 挂载停止计时器方法
      };
    };

    // 清除状态信息，路由跳转到游戏详情必须携带标记 fromRefresh: true
    if (location.state) {
      // 在组件挂载时清除状态
      navigate("/gameDetail", { replace: true, state: null });
      iniliteFun();
    }
  }, [location, navigate]);

  return (
    <div className="home-module-detail">
      <img
        className="back-icon"
        src={`${
          detailData?.background_img
            ? process.env.REACT_APP_SHEER_API_URL + detailData?.background_img
            : iniliteBackGIcon
        }`}
        alt=""
        onError={(e: any) => {
          e.target.onerror = null; // 防止错误循环
          e.target.src = iniliteBackGIcon;
        }}
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
            <div className="default-game-logo-box">
              <img
                className="default-game-logo"
                src={`${
                  detailData?.logo
                    ? process.env.REACT_APP_SHEER_API_URL + detailData?.logo
                    : gameErroricon
                }`}
                alt=""
                onError={(e: any) => {
                  e.target.onerror = null; // 防止错误循环
                  e.target.src = gameErroricon;
                }}
              />
            </div>
            <div className="game-text">{detailData?.name}</div>
            {detailData?.pc_platform?.length > 0 && (
              <div className="platfrom">
                <div className="text">已同步加速</div>
                <div className="icon-box">
                  {findMappingIcon(detailData)?.length > 0 &&
                    findMappingIcon(detailData)?.map((item: any) => {
                      return (
                        <span key={item?.id}>
                          <BaseTooltip
                            content={item?.name}
                            style={{ width: "auto" }}
                          >
                            <img src={item?.icon} alt="" />
                          </BaseTooltip>
                        </span>
                      );
                    })}
                </div>
              </div>
            )}
            <div
              className="game-btn"
              style={{
                opacity: startLoading ? 0.5 : 1,
                cursor: startLoading ? "no-drop" : "pointer",
              }}
            >
              <Button
                className="Launching on-game"
                style={{ cursor: startLoading ? "no-drop" : "pointer" }}
                type="default"
                onClick={(event) => {
                  if (!startLoading) {
                    startProgress(detailData, "human", event);
                  }
                }}
              >
                <img src={activateIcon} width={18} height={18} alt="" />
                <span>{startLoading ? "启动中" : "启动游戏"}</span>
              </Button>
              <Button
                className="path"
                style={{ cursor: startLoading ? "no-drop" : "pointer" }}
                type="default"
                onClick={() => {
                  if (!startLoading) {
                    dispatch(setStartPathOpen(true));
                  }
                }}
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
              <span>
                <img src={toggleIcon} alt="" />
                切换
              </span>
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
                  <div>{1}ms</div>
                  {/* <div className="line">
                    <div className="animate-line" />
                  </div> */}
                  <img src={appliancesGit} alt="" />
                </div>
                <div className="icon-box">
                  <img src={computingIcon} alt="" />
                  <div>路由器</div>
                </div>

                <div className="line-box">
                  <div>{lostBag - 1}ms</div>
                  {/* <div className="line">
                    <div className="animate-line" />
                  </div> */}
                  <img src={appliancesGit} alt="" />
                </div>
                <div className="icon-box">
                  <img src={computerIcon} alt="" />
                  <div>服务器</div>
                </div>
              </div>
            </div>
            <div className="tendencies info-common-style">
              <div className="header">
                <div className="delay">
                  {/* <div className="public-delay original-delay">
                    <div className="line" />
                    <span>原始延迟</span>
                  </div> */}
                  <div className="public-delay optimized-delay">
                    {/* <div className="line" /> */}
                    {/* <span>优化延迟</span> */}
                  </div>
                </div>
                <div className="title">加速趋势</div>
                <div className="time">3分钟内</div>
              </div>
              <div className="chart-box">
                <LineChart data={memoizedData} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalVisible ? (
        <RegionNodeSelector
          open={isModalVisible}
          options={detailData}
          onCancel={() => setIsModalVisible(false)}
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
    </div>
  );
};

export default GameDetail;
