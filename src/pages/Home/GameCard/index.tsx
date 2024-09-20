/*
 * @Author: zhangda
 * @Date: 2024-06-08 13:30:02
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-09-20 14:40:26
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import { openRealNameModal } from "@/redux/actions/auth";
import { useHandleUserInfo } from "@/hooks/useHandleUserInfo";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { store } from "@/redux/store";
import { nodeDebounce } from "@/common/utils";
import axios from 'axios'
import tracking from "@/common/tracking";
import "./style.scss";
import RegionNodeSelector from "@/containers/region-node";
import RealNameModal from "@/containers/real-name";
import MinorModal from "@/containers/minor";
import PayModal from "@/containers/Pay";
import BreakConfirmModal from "@/containers/break-confirm";
import eventBus from "@/api/eventBus";
import playSuitApi from "@/api/speed";
import gameApi from "@/api/gamelist";

import addIcon from "@/assets/images/common/add.svg";
import select from "@/assets/images/home/select@2x.png";
import closeIcon from "@/assets/images/common/close.svg";
import arrowIcon from "@/assets/images/common/accel-arrow.svg";
import accelerateIcon from "@/assets/images/common/accelerate.svg";
import rightArrow from "@/assets/images/common/right-arrow.svg";
import acceleratedIcon from "@/assets/images/common/accelerated.svg";
import cessationIcon from "@/assets/images/common/cessation.svg";

interface GameCardProps {
  options: any;
  locationType: string;
  customAccelerationData?: any;
  triggerDataUpdate?: () => void;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const {
    options = [],
    locationType = "home",
    customAccelerationData = {},
    triggerDataUpdate = () => {},
  } = props;
  const childRef: any = useRef(null);
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 获取 redux 中的用户信息
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen); // 实名认证
  const accDelay = useSelector((state: any) => state.auth.delay); // 延迟毫秒数

  const historyContext: any = useHistoryContext();

  const {
    getGameList,
    identifyAccelerationData,
    removeGameList,
    accelerateGameToList,
    checkGameisFree,
  } = useGamesInitialize();

  const { handleUserInfo } = useHandleUserInfo();

  const [minorType, setMinorType] = useState<string>("acceleration"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip
  const [renewalOpen, setRenewalOpen] = useState(false); // 续费提醒
  const [isOpenRegion, setIsOpenRegion] = useState(false); // 是否是打开选择区服节点

  const [accelOpen, setAccelOpen] = useState(false); // 是否确认加速
  const [stopModalOpen, setStopModalOpen] = useState(false); // 停止加速确认
  const [isStartAnimate, setIsStartAnimate] = useState(false); // 是否开始加速动画
  const [selectAccelerateOption, setSelectAccelerateOption] = useState<any>(); // 选择加速的数据

  const [isAllowAcceleration, setIsAllowAcceleration] = useState<boolean>(true); // 是否允许加速
  const [isAllowShowAccelerating, setIsAllowShowAccelerating] =
    useState<boolean>(true); // 是否允许显示加速中
  const [isClicking, setIsClicking] = useState(false);
  const isHomeNullCard =
    locationType === "home" && options?.length < 4 && options?.length > 0; // 判断是否是首页无数据卡片条件

  const userToken = localStorage.getItem("token");
  const jsKey = localStorage.getItem("StartKey");

  const isRealNamel = localStorage.getItem("isRealName");

  // 停止加速
  const stopAcceleration = () => {
    setStopModalOpen(false);
    let jsonString = "";
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
        removeGameList("initialize"); // 更新我的游戏
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        triggerDataUpdate(); // 更新显示数据
      }
    );
  };

  // 获取游戏运营平台列表
  const fetchPcPlatformList = async () => {
    try {
      let res = await playSuitApi.pcPlatform();

      return res?.data;
    } catch (error) {
      console.log(error);
    }
  };
  //查询黑白名单列表数据
  const fetchPcWhiteBlackList = async () => {
    try {
      let res = await playSuitApi.playSpeedBlackWhitelist();

      return res?.data;
    } catch (error) {
      console.log(error);
    }
  };

  // 多次请求同时触发函数
  const triggerMultipleRequests = async (loopBody: any = []) => {
    let api_group: any = [];

    if (Array.isArray(loopBody) && loopBody.length > 0) {
      loopBody.forEach((key: any) => {
        const { list, pid } = key;

        api_group.push(
          playSuitApi.speedInfo({
            platform: 3,
            gid: list?.[0]?.id,
            pid: pid,
          })
        );
      });
    }

    const data: any = await Promise.all(api_group); // 请求等待统一请求完毕

    const result_data = data.reduce(
      (acc: any, item: any) => {
        const { executable } = item.data;

        // 聚合 executable 数据
        if (Array.isArray(executable) && executable.length > 0) {
          acc.executable = acc.executable.concat(executable);
        }

        return acc;
      },
      { executable: [] }
    );

    return result_data;
  };

  // 查询当前游戏所在平台对应的游戏id
  const queryGameIdByPlatform = async (
    platform: any = [],
    pc_platform: any = {}
  ) => {
    let api_group: any = [];

    if (Array.isArray(platform) && platform.length > 0) {
      platform.forEach((key: any) => {
        let param = {
          t: "游戏平台",
          s: pc_platform?.[key],
        };
        api_group.push(
          gameApi.gameList(param).then((response: any) => {
            return { pid: key, param, list: response?.data?.list };
          })
        );
      });
    }

    const data: any = await Promise.all(api_group);
    return data; // 请求等待统一请求完毕
  };

  // 查询当前游戏在各个平台的执行文件
  const queryPlatformGameFiles = async (
    platform: any = {},
    option: any = {}
  ) => {
    const default_platform = Object?.keys(platform) || []; // 运营平台数据
    let api_group: any = [];

    if (Array.isArray(default_platform) && default_platform.length > 0) {
      default_platform.forEach((key: any) => {
        api_group.push(
          playSuitApi.speedInfo({
            platform: 3,
            gid: option?.id,
            pid: key,
          })
        );
      });
    }

    const data: any = await Promise.all(api_group); // 请求等待统一请求完毕

    // 聚合所以的api 数据中的 executable
    const result = data.reduce(
      (acc: any, item: any) => {
        const { executable, pc_platform } = item.data;
        const isExecutable = Array.isArray(executable) && executable.length > 0;

        // 聚合 executable 数据
        if (isExecutable) {
          acc.executable = acc.executable.concat(executable);
        }

        // 聚合 pc_platform 数据
        if (pc_platform !== 0 && isExecutable) {
          acc.pc_platform.push(default_platform?.[pc_platform]);
        }

        return acc;
      },
      { executable: [], pc_platform: [] }
    );

    return result;
  };

  // 通知客户端进行游戏加速
  const handleSuitDomList = async (option: any) => {
    try {
      tracking.trackBoostStart(option.name);
      tracking.trackBoostSuccess(
        option.name,
        option?.serverNode?.selectRegion?.qu +
          option?.serverNode?.selectRegion?.fu,
        option.serverNode.selectNode
      );
      let platform = await fetchPcPlatformList(); // 请求运营平台接口
      let WhiteBlackList = await fetchPcWhiteBlackList(); //请求黑白名单，加速使用数据
      let gameFiles = await queryPlatformGameFiles(platform, option); // 查询当前游戏在各个平台的执行文件
      let { executable, pc_platform } = gameFiles;

      if (pc_platform?.length > 0) {
        const gameResult = await queryGameIdByPlatform(pc_platform, platform);
        const processResult = await triggerMultipleRequests(gameResult);

        executable = [...executable, ...processResult?.executable];
      }

      const uniqueExecutable = Array.from(
        new Map(executable.map((item: any) => [item.path, item])).values()
      );

      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const { addr = "", server, id } = option.serverNode.selectNode; //目前只有一个服务器，后期增多要遍历
      console.log(option.serverNode.selectNode, addr);

      const startInfo = await playSuitApi.playSpeedStart({
        platform: 3,
        gid: option?.id,
        nid: id,
      }); // 游戏加速信息
      const js_key = startInfo?.data?.js_key;
      const proxy_speed_limit = startInfo?.data?.proxy_speed_limit;

      localStorage.setItem("StartKey", id);
      localStorage.setItem("speedIp", addr);
      localStorage.setItem("speedGid", option?.id);

      // 真实拼接
      // const jsonResult = JSON.stringify({
      //   params: {
      //     process: [...uniqueExecutable],
      //     black_ip: WhiteBlackList.blacklist.ipv4,
      //     black_domain: WhiteBlackList.blacklist.domain,
      //     // tcp_tunnel_mode: 0,
      //     // udp_tunnel_mode: 1,
      //     user_id: accountInfo?.userInfo?.id,
      //     game_id: option?.id,
      //     tunnel: {
      //       address: addr,
      //       server: server,
      //     },
      //     js_key,
      //     proxy_speed_limit,
      //   },
      // });
      const jsonResult = JSON.stringify({
        running_status: true,
        accelerated_apps: uniqueExecutable,
        domain_blacklist: WhiteBlackList.blacklist.domain,
        ip_blacklist: WhiteBlackList.blacklist.ipv4,
        domain_whitelist: [], // Assuming empty for now
        ip_whitelist: [], // Assuming empty for now
        acceleration_nodes: server.map((s: any) => ({
          server_address: `${addr}:${s.port}`,
          inbound_protocol: s.protocol.from,
          outbound_protocol: s.protocol.to,
          acc_key: js_key
        }))
      });
      
      console.log(jsonResult);
      // return new Promise((resolve, reject) => {
      //   (window as any).NativeApi_AsynchronousRequest(
      //     "NativeApi_StartProcessProxy",
      //     jsonResult,
      //     function (response: any) {
      //       const isCheck = JSON.parse(response);
      //       console.log("是否开启真实加速(1成功)", response);

      //       if (isCheck?.success === 1) {
      //         // console.log("成功开启真实加速中:", isCheck);
      //         resolve({ state: true, platform: pc_platform });
      //       } else {
      //         tracking.trackBoostFailure("加速失败，检查文件合法性");
      //         // tracking.trackBoostDisconnectManual("手动停止加速");
      //         stopAcceleration();
      //         resolve({ state: false });
      //       }
      //     }
      //   );
      // });
      return new Promise((resolve, reject) => {
        (window as any).NativeApi_AsynchronousRequest(
          "NativeApi_StartProxy",
          '',
          async function (response: any) {
            console.log("是否开启真实加速(1成功)", response);
            const responseObj = JSON.parse(response);  // 解析外层 response
            const restfulObj = JSON.parse(responseObj.restful);  // 解析内部 restful
            const isCheck = JSON.parse(response);
            console.log("是否开启真实加速(1成功)", response);
            console.log(restfulObj);  // { port: 57499, version: "1.0.0.1" }
            // 检查是否有 restful 字段，并解析为 JSON
            if (restfulObj) {
      
              // 检查解析后的 restfulData 是否包含 port
              if (restfulObj?.port) {
                const url = `http://127.0.0.1:${restfulObj.port}/start`; // 拼接 URL
      
                try {
                  // 发起 POST 请求，body 为 jsonResult
                  const result = await axios.post(url, jsonResult, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
      
                  console.log('请求成功:', result.data);
                  if (result.data === "Acceleration started") {
                    // console.log("成功开启真实加速中:", isCheck);
                    resolve({ state: true, platform: pc_platform });
                  } else {
                    tracking.trackBoostFailure("加速失败，检查文件合法性");
                    // tracking.trackBoostDisconnectManual("手动停止加速");
                    stopAcceleration();
                    resolve({ state: false });
                  }
                   
                } catch (error) {
                  console.error('请求失败:', error);
                  reject(error); // 请求失败，返回错误信息
                }
              } else {
                console.error("端口信息缺失");
                reject("端口信息缺失");
              }
            } else {
              console.error("响应数据缺失");
              reject("响应数据缺失");
            }
          }
        );
      });
    } catch (error) {
      return false;
    }
  };

  // 加速实际操作
  const accelerateProcessing = async (event = selectAccelerateOption) => {
    let option = { ...event };

    const region = option?.serverNode?.region || [];
    const selectRegion = region.filter((item: any) => item?.is_select)?.[0];

    if (!selectRegion) {
      setIsOpenRegion(true);
      return;
    }
    
    localStorage.setItem("isAccelLoaindg", "1"); // 存储临时的加速中状态
    setIsAllowAcceleration(false); // 禁用立即加速
    setIsAllowShowAccelerating(false); // 禁用显示加速中
    setIsStartAnimate(true); // 开始加速动画
    stopAcceleration(); // 停止加速
    
    // 进行重新ping节点
    if (childRef?.current) {
      option = await childRef?.current?.getFastestNode(selectRegion, option);
    }

    const nodeHistory = option?.serverNode?.nodeHistory || [];
    const selectNode = nodeHistory.filter((item: any) => item?.is_select)?.[0];
    
    option.serverNode.selectNode = selectNode; // 给数据添加已名字的节点
    option.serverNode.selectRegion = selectRegion; // 给数据添加已名字的区服

    let isPre: boolean;

    // 校验是否合法文件
    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_PreCheckEnv",
      "",
      async function (response: any) {
        console.log("Success response from 校验是否合法文件:", response);
        const isCheck = JSON.parse(response);

        if (!response) {
          tracking.trackBoostFailure("加速失败，检查文件合法性");
          tracking.trackBoostDisconnectManual("手动停止加速");
          eventBus.emit("showModal", {
            show: true,
            type: "infectedOrHijacked",
          });
        }
        
        // 暂时注释 实际生产打开
        if (isCheck?.pre_check_status === 0) {
          const state: any = await handleSuitDomList(option); // 通知客户端进行加速

          if (state?.state) {
            accelerateGameToList(option, {
              acc_platform: state?.platform,
            }); // 加速完后更新我的游戏
            isPre = true;
          } else {
            tracking.trackBoostFailure("加速失败，检查文件合法性");
            tracking.trackBoostDisconnectManual("手动停止加速");
            isPre = false;
            eventBus.emit("showModal", {
              show: true,
              type: "infectedOrHijacked",
            });
          }
        } else {
          console.log(`不是合法文件，请重新安装加速器`);
          tracking.trackBoostFailure("加速失败，检查文件合法性");
          tracking.trackBoostDisconnectManual("手动停止加速");
          isPre = false;
          eventBus.emit("showModal", {
            show: true,
            type: "infectedOrHijacked",
          });
        }

        setTimeout(() => {
          localStorage.removeItem("isAccelLoaindg"); // 删除存储临时的加速中状态
          setIsAllowAcceleration(true); // 启用立即加速
          setIsAllowShowAccelerating(true); // 启用显示加速中
          setIsStartAnimate(false); // 结束加速动画

          if (isPre) {
            navigate("/gameDetail");
          }
        }, 1000);
      }
    );
  };
  
  // 确认开始加速
  const confirmStartAcceleration = () => {
    setAccelOpen(false); // 关闭确认框
    accelerateProcessing();
  };

  // 清除选择卡片
  const handleClearGame = (option: object) => {
    removeGameList(option);
    triggerDataUpdate();
  };

  // 点击立即加速
  const accelerateDataHandling = async (option: any) => {
    // 是否登录
    if (accountInfo?.isLogin) {
      // let res = await handleUserInfo(); // 先请求用户信息，进行用户信息的更新
      const latestAccountInfo = store.getState().accountInfo;

      if (latestAccountInfo) {
        const userInfo = latestAccountInfo?.userInfo; // 用户信息
        const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息

        let game_list = getGameList(); // 获取当前我的游戏列表
        let find_accel = identifyAccelerationData(game_list); // 查找是否有已加速的信息

        option = await checkGameisFree(option);

        // 是否实名认证 isRealNamel === "1" 是
        // 是否是未成年
        // 是否是vip
        // 是否有加速中的游戏
        if (isRealNamel === "1") {
          dispatch(openRealNameModal());
          return;
        } else if (!userInfo?.user_ext?.is_adult) {
          setIsMinorOpen(true);
          setMinorType("acceleration");
          return;
        } else if (
          !(option?.free_time && option?.tags.includes("限时免费")) &&
          !userInfo?.is_vip
        ) {
          setIsModalOpenVip(true);
          return;
        } else if (find_accel?.[0] && (option?.router !== "details")) {
          setAccelOpen(true);
          setSelectAccelerateOption(option);
          return;
        } else {
          let time = new Date().getTime() / 1000;
          let renewalTime = Number(localStorage.getItem("renewalTime")) || 0;

          if (
            userInfo?.is_vip &&
            time - renewalTime > 86400 &&
            userInfo?.vip_expiration_time - time <= 432000
          ) {
            setRenewalOpen(true);
            localStorage.setItem("renewalTime", String(time));
          } else {
            // localStorage.setItem("isAccelLoaindg", "1");
            accelerateProcessing(option);
            setSelectAccelerateOption(option);
          }
        }
      }
    } else {
      dispatch(setAccountInfo(undefined, undefined, true)); // 未登录弹出登录框
    }
  };


  const openModal = async (event: React.MouseEvent<HTMLImageElement>, option: any) => {
    const latestAccountInfo = store.getState().accountInfo;

    if (accountInfo?.isLogin) {
      if (isRealNamel === "1") {
        dispatch(openRealNameModal());
        return;
      } else if (!latestAccountInfo?.userInfo?.user_ext?.is_adult) {
        setIsMinorOpen(true);
        setMinorType("recharge");
        return;
      } else {
        event.stopPropagation();
        setIsOpenRegion(true);
        setSelectAccelerateOption(option);
      }
    } else {
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  // 创建一个防抖函数
  const debouncedAccelerateDataHandling = nodeDebounce((option: any) => {
    accelerateDataHandling(option);
  }, 300);

  // 如果有自定义的加速数据 则替换选择加速数据 并且进行加速
  useEffect(() => {
    if (Object.keys(customAccelerationData)?.length > 0) {
      setSelectAccelerateOption(customAccelerationData);
      accelerateDataHandling(customAccelerationData);
    }
  }, [customAccelerationData]);

  return (
    <div
      className={`game-card-module ${
        locationType === "home" && "home-game-card-module"
      } ${locationType === "my-game" && "my-game-card-module"}`}
    >
      {options?.map((option: any) => {
        return (
          <div className={`game-card`} key={option?.id}>
            <img
              className="background-img"
              src={option?.cover_img}
              alt={option.name}
            />
            {/* 立即加速卡片 */}
            {localStorage.getItem("isAccelLoaindg") !== "1" &&
            isAllowAcceleration ? (
              <div
                className="accelerate-immediately-card"
                onClick={async () => {
                  setIsClicking(true);

                  if (!isClicking) {
                    // debouncedAccelerateDataHandling(option);
                    await accelerateDataHandling(option);
                  }

                  setIsClicking(false)
                }}
              >
                <img className="mask-layer-img" src={accelerateIcon} alt="" />
                <img
                  className="select-game-img"
                  src={select}
                  alt=""
                  onClick={(event) => openModal(event, option)}
                />
                <img
                  className="clear-game-img"
                  src={closeIcon}
                  alt=""
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearGame(option);
                  }}
                />
                <div
                  className="accelerate-immediately-button"
                  onClick={async (event) => {
                    event.stopPropagation();
                    setIsClicking(true);

                    if (!isClicking) {
                      // debouncedAccelerateDataHandling(option);
                      await accelerateDataHandling(option);
                    }

                    setIsClicking(false);
                  }}
                >
                  <span className="accelerate-immediately-text">立即加速</span>
                  <img
                    className="accelerate-immediately-img"
                    src={arrowIcon}
                    alt=""
                  />
                </div>
              </div>
            ) : null}
            {/* 加速动画卡片 */}
            {isStartAnimate && selectAccelerateOption?.id === option?.id ? (
              <div className={"accelerate-animate-card"}>
                <div className={"animate-text"}>加速中...</div>
                <div
                  className={`accelerate-animate ${
                    isStartAnimate && "accelerate-animate-start"
                  }`}
                />
              </div>
            ) : null}
            {/* 加速中卡片 */}
            {isAllowShowAccelerating && option?.is_accelerate ? (
              <div
                className="accelerating-card"
                onClick={() => navigate("/gameDetail")}
              >
                <img
                  className="accelerating-content-img"
                  src={acceleratedIcon}
                  alt=""
                />
                <div className="accelerating-content">
                  {locationType === "home" && (
                    <>
                      <div className="instant-delay">即时延迟</div>
                      <div className="speed">
                        {accDelay || 2}
                        <span>ms</span>
                      </div>
                    </>
                  )}
                  <div className="enter-details">
                    <span>进入详情</span>
                    <img src={rightArrow} alt="" />
                  </div>
                  <div
                    className="down-accelerate"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStopModalOpen(true);
                    }}
                  >
                    <img src={cessationIcon} width={18} height={18} alt="" />
                    <span>停止加速</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="game-card-text">{option?.name}</div>
          </div>
        );
      })}
      {/* 首页数据不足4个时 触发添加数据卡片 */}
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
      {/* 实名认证弹窗 */}
      {isRealOpen ? <RealNameModal /> : null}
      {/* 未成年成年弹窗 */}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
      {/* vip 充值弹窗 */}
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {/* 确认加速弹窗 */}
      {accelOpen ? (
        <BreakConfirmModal
          accelOpen={accelOpen}
          type={"accelerate"}
          setAccelOpen={setAccelOpen}
          onConfirm={confirmStartAcceleration}
        />
      ) : null}
      {/* 停止加速确认弹窗 */}
      {stopModalOpen ? (
        <BreakConfirmModal
          accelOpen={stopModalOpen}
          type={"stopAccelerate"}
          setAccelOpen={setStopModalOpen}
          onConfirm={stopAcceleration}
        />
      ) : null}
      {/* 节点区服弹窗 */}
      <RegionNodeSelector
        ref={childRef}
        open={isOpenRegion}
        type={"acelerate"}
        options={selectAccelerateOption}
        onCancel={() => {
          triggerDataUpdate();
          setIsOpenRegion(false);
        }}
        notice={(e) => accelerateDataHandling(e)}
      />
      {/* 续费提醒确认弹窗 */}
      {renewalOpen ? (
        <BreakConfirmModal
          accelOpen={renewalOpen}
          type={"renewalReminder"}
          setAccelOpen={setRenewalOpen}
          onConfirm={() => {
            setRenewalOpen(false);
            setIsModalOpenVip(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default GameCard;
