/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-07 16:48:38
 * @FilePath: \speed\src\pages\Home\GameDetail\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMyGames } from "@/common/utils";
import { updateDelay, stopAccelerate } from "@/redux/actions/auth";

import "./style.scss";
import ActivationModal from "@/containers/activation-mode";
import StopConfirmModal from "@/containers/stop-confirm";

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

const GameDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [stopModalOpen, setStopModalOpen] = useState(false);

  const [detailData, setDetailData] = useState<any>({}); // 当前加速游戏数据
  const [lostBag, setLostBag] = useState<any>(); // 实时延迟
  const [packetLoss, setPacketLoss] = useState<any>(); // 丢包率

  const [regionInfo, setRegionInfo] = useState<any>(); // 当前加速区服

  const [count, setCount] = useState(0);
  const [onCount, setOnCount] = useState(0);

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

  const stopSpeed = () => {
    console.log("停止加速---------------");

    const requestData = JSON.stringify({
      method: "NativeApi_StopProxy",
      params: null,
    });

    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("停止加速----------:", response);
        let game_arr = getMyGames();

        game_arr = game_arr.map((item: any) => ({
          ...item,
          is_accelerate: false,
        }));

        dispatch(stopAccelerate(false));
        window.clearInterval((window as any).delayInterval);
        (window as any).delayInterval = null;
        localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_arr));
        navigate("/home");
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("加速失败 failed:", errorMessage);
      },
    });
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
    let arr = getMyGames();
    let details_arr = arr.filter((item: any) => item?.is_accelerate);
    let region_info = details_arr?.[0]?.select_region.filter(
      (item: any) => item?.is_select
    );

    const speedIp = localStorage.getItem("speedIp");
    const speedInfoString = localStorage.getItem("speedInfo");
    const speedInfo = speedInfoString ? JSON.parse(speedInfoString) : null;

    let details_arr_index = arr.findIndex((item: any) => item?.is_accelerate);
    let elementToMove = arr.splice(details_arr_index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

    // 将取出的元素插入到位置1
    arr.splice(0, 0, elementToMove);
    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));

    console.log("我的游戏总数据", arr);
    console.log("当前加速游戏数据", details_arr);
    console.log("speedInfo全部信息", speedInfo);

    const requestData = JSON.stringify({
      method: "NativeApi_GetIpDelayByICMP",
      params: { ip: speedIp },
    });
    console.log(requestData, speedIp, "1111111111111111");

    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("详情丢包信息=========================:", response);
        const jsonResponse = JSON.parse(response).delay; //{"delay":32(这个是毫秒,9999代表超时与丢包)}

        let lost_bag = jsonResponse < 2 ? 2 : jsonResponse;
        // 示例
        const dataArray = generateDataEvery10Seconds(lost_bag);

        setChartData(dataArray);
        setLostBag(lost_bag);
        dispatch(updateDelay(lost_bag));
        setPacketLoss(jsonResponse === 9999 ? 25 : 0);
        setDetailData(details_arr?.[0] || {});
        setRegionInfo(region_info?.[0]);
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("Query failed:", errorMessage);
      },
    });
  }, []);

  useEffect(() => {
    let arr = getMyGames();
    let details_arr = arr.filter((item: any) => item?.is_accelerate);
    const speedIp = localStorage.getItem("speedIp");
    const speedInfoString = localStorage.getItem("speedInfo");
    const speedInfo = speedInfoString ? JSON.parse(speedInfoString) : null;

    let details_arr_index = arr.findIndex((item: any) => item?.is_accelerate);
    let elementToMove = arr.splice(details_arr_index, 1)[0]; // splice返回被删除的元素数组，所以我们使用[0]来取出被删除的元素

    // 将取出的元素插入到位置1
    arr.splice(0, 0, elementToMove);
    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));

    console.log("我的游戏总数据", arr);
    console.log("当前加速游戏数据", details_arr);
    console.log("speedInfo全部信息", speedInfo);

    // @ts-ignore

    // 每隔 10 秒增加计数器的值
    const delayInterval = setInterval(() => {
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

          let lost_bag = jsonResponse < 2 ? 2 : jsonResponse;
          setChartData((chart: any) => {
            chart.shift();

            let lastElement = chart[chart.length - 1];
            let newData = {
              timestamp: lastElement.timestamp + 10,
              value: lost_bag,
            };

            chart.push(newData);

            return chart;
          });

          setLostBag(lost_bag);
          setPacketLoss(jsonResponse === 9999 ? 25 : 0);
          dispatch(updateDelay(lost_bag));
        },
        onFailure: (errorCode: any, errorMessage: any) => {
          console.error("Query failed:", errorMessage);
        },
      });
    }, 10000);

    // 返回一个清理函数，在组件卸载时清除定时器
    // return () => clearInterval(interval);
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [onCount]);

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
              {formatTime(onCount)}
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
        <StopConfirmModal
          accelOpen={stopModalOpen}
          setAccelOpen={setStopModalOpen}
          onConfirm={() => {
            setStopModalOpen(false);
            stopSpeed();
          }}
        />
      ) : null}
    </div>
  );
};

export default GameDetail;
