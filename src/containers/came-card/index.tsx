/*
 * @Author: zhangda
 * @Date: 2024-06-08 13:30:02
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-09-20 19:17:08
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\pages\Home\GameCard\index.tsx
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import { openRealNameModal, setBoostTrack } from "@/redux/actions/auth";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { store } from "@/redux/store";
import {
  setPayState,
  setMinorState,
  setVersionState,
} from "@/redux/actions/modal-open";
import { areaStyleClass } from "./utils";
import { compareVersions } from "@/layout/utils";
import { validateRequiredParams } from "@/common/utils";

import "./style.scss";
import "./home.scss";
import "./my-game.scss";
import "./library.scss";
import "./result.scss";
import axios from "axios";
import tracking from "@/common/tracking";
import RegionNodeSelector from "@/containers/region-node";
import RealNameModal from "@/containers/real-name";
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
import addThemeIcon from "@/assets/images/common/add-theme.svg";
import iniliteCardIcon from "@/assets/images/common/inilite-card.jpg";

interface GameCardProps {
  options: any;
  locationType: string;
  customAccelerationData?: any;
  bindRef?: any;
  triggerDataUpdate?: () => void;
  onScroll?: () => void;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const {
    options = [],
    locationType = "home",
    customAccelerationData = {},
    bindRef,
    triggerDataUpdate = () => {},
    onScroll = () => {},
  } = props;
  const childRef: any = useRef(null);
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 获取 redux 中的用户信息
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen); // 实名认证
  const accDelay = useSelector((state: any) => state.auth.delay); // 延迟毫秒数
  
  const { open: versionOpen = false } = useSelector(
    (state: any) => state?.modalOpen?.versionState
  ); // 升级弹窗开关

  const webVersion = process.env.REACT_APP_VERSION; // 前端版本号
  const clientVersion = (window as any).versionNowRef; // 客户端版本号

  const {
    identifyAccelerationData,
    removeGameList,
    accelerateGameToList,
    checkGameisFree,
    checkShelves,
    appendGameToList,
    renderHistoryAreaSuit,
  } = useGamesInitialize();

  const [renewalOpen, setRenewalOpen] = useState(false); // 续费提醒
  const [isOpenRegion, setIsOpenRegion] = useState(false); // 是否是打开选择区服节点
  const [regionType, setRegionType] = useState(""); // 触发区服节点来源

  const [accelOpen, setAccelOpen] = useState(false); // 是否确认加速
  const [stopModalOpen, setStopModalOpen] = useState(false); // 停止加速确认
  const [isStartAnimate, setIsStartAnimate] = useState(false); // 是否开始加速动画
  const [selectAccelerateOption, setSelectAccelerateOption] = useState<any>(); // 选择加速的数据

  const [isAllowAcceleration, setIsAllowAcceleration] = useState<boolean>(true); // 是否允许加速
  const [isAllowShowAccelerating, setIsAllowShowAccelerating] =
    useState<boolean>(true); // 是否允许显示加速中
  const [isVerifying, setIsVerifying] = useState(false); // 是否在校验中

  const isHomeNullCard =
    locationType === "home" && options?.length < 4 && options?.length > 0; // 判断是否是首页无数据卡片条件

  // 停止加速
  const stopAcceleration = async () => {
    setStopModalOpen(false);
    const stopActive = localStorage.getItem("stopActive") === "1";
    const data = await (window as any).stopProcessReset();
    const list =
      (data?.data ?? []).filter(
        (item: any) => item?.id === selectAccelerateOption?.id
      )?.[0] || {};

    if (stopActive) {
      tracking.trackBoostDisconnectManual();
      localStorage.removeItem("stopActive");
    }
    
    setSelectAccelerateOption({
      ...selectAccelerateOption,
      is_accelerate:
        list?.is_accelerate ?? selectAccelerateOption?.is_accelerate,
    });
    triggerDataUpdate(); // 更新显示数据

    return list;
  };

  // 获取游戏运营平台列表
  const fetchPcPlatformList = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      const res = await playSuitApi.pcPlatform();
      const url = "/api/v1/game/pc_platform/list";

      if (res?.error === 0) {
        return res?.data;
      } else {
        tracking.trackBoostFailure(
          `server=${res?.error};msg=${res?.message?.slice(
            0,
            132
          )};apiName=${url};version=${clientVersion + "," + webVersion}`
        );
      }
    } catch (error) {
      console.log("获取游戏运营平台列表", "error");
    }
  };

  //查询黑白名单列表数据
  const fetchPcWhiteBlackList = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }
      
      const res = await playSuitApi.playSpeedBlackWhitelist();
      const url = "/api/v1/black_white_list";

      if (res?.error === 0) {
        return res?.data;
      } else {
        tracking.trackBoostFailure(
          `server=${res?.error};msg=${res?.message?.slice(
            0,
            132
          )};apiName=${url};version=${clientVersion + "," + webVersion}`
        );
      }
    } catch (error) {
      console.log("查询黑白名单列表数据", "error");
    }
  };

  // 聚合 executable 数据
  const triggerMultipleRequests = async (loopBody: any = []) => {
    const data: any = loopBody?.[0]?.list || []; // 游戏信息数据
    const result_data = data.reduce(
      (acc: any, item: any) => {
        const { executable } = item;

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
            const url = "/api/v1/game/list";

            if (response?.error !== 0) {
              tracking.trackBoostFailure(
                `server=${response?.error};msg=${response?.message?.slice(
                  0,
                  132
                )};apiName=${url};version=${clientVersion + "," + webVersion}`
              );
            }

            return { pid: key, param, list: response?.data?.list || [] };
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
    const data = option?.game_speed ?? []; // 读取游戏的平台信息

    // 聚合所以的api 数据中的 executable
    const result = data.reduce(
      (acc: any, item: any) => {
        const {
          executable,
          pc_platform,
          start_info = {},
          domain_blacklist = [],
          domain_list = [],
          ipv4_blacklist = [],
          ipv4_list = [],
          executable_blacklist = [],
        } = item;
        const isExecutable = Array.isArray(executable) && executable.length > 0;

        // 聚合 executable 数据
        if (isExecutable) {
          acc.executable = acc.executable.concat(executable);
        }

        // 平台类型和pid相同，并且启动路径存在
        if (Number(pc_platform) && start_info?.path) {
          acc.startGather.push({
            pc_platform,
            pid: String(pc_platform),
            path: start_info?.path + start_info?.args,
            name: platform?.[pc_platform],
          });
        }

        const isAarray = (arr: any) => {
          if (Array.isArray(arr) && arr?.length > 0) {
            return true;
          } else {
            return false;
          }
        };

        // domain 黑名单
        if (isAarray(domain_blacklist)) {
          acc.domain_blacklist = acc.domain_blacklist.concat(domain_blacklist);
        }

        // domain 白名单
        if (isAarray(domain_list)) {
          acc.domain_list = acc.domain_list.concat(domain_list);
        }

        // ip 黑名单名单
        if (isAarray(ipv4_blacklist)) {
          acc.ipv4_blacklist = acc.ipv4_blacklist.concat(ipv4_blacklist);
        }

        // ip 白名单
        if (isAarray(ipv4_list)) {
          acc.ipv4_list = acc.ipv4_list.concat(ipv4_list);
        }

        // 进程黑名单
        if (isAarray(executable_blacklist)) {
          acc.executable_blacklist =
            acc.executable_blacklist.concat(executable_blacklist);
        }

        return acc;
      },
      {
        executable: [],
        pc_platform: [],
        startGather: [],
        domain_blacklist: [],
        domain_list: [],
        ipv4_blacklist: [],
        ipv4_list: [],
        executable_blacklist: [],
      }
    );

    return result;
  };

  // 处理加速时启动方式的数据更新
  const assembleFun = (option: any, startGather: any) => {
    let storage: any = localStorage.getItem("startAssemble"); // 读取游戏启动路径信息
    let assemble = storage ? JSON.parse(storage) : []; // 游戏启动路径信息
    let current = assemble.find((child: any) => child?.id === option?.id); // 查找当前存储中是否存储过此游戏启动路径信息
    let first = (startGather || []).find((child: any) => child?.path); // 查找平台列表路径存在的第一个数据
    let value = first ? first : startGather?.[0]; // 如果有存在的平台则使用存在的平台没有则使用自定义数据

    // 如果找到则进行启动平台数据更新 否则添加新数据
    if (current) {
      assemble = assemble.map((item: any) => {
        if (item?.id === option?.id) {
          let select = { ...item }; // 默认赋值存储数据

          // 如果存储数据没有选中的启动信息
          if (!item?.path) {
            // 如果查找路径存在的第一个数据存在，更新到储存数据中
            if (first) {
              select = first;
            } else {
              select = item?.platform?.[0];
            }
          } else {
            // 如果存储数据有选中的启动信息,判断选中的信息是否在最新的平台列表中
            const isFind = (item?.platform || []).find((child: any) =>
              startGather.some(
                (element: any) =>
                  element.path &&
                  element.path === child?.path &&
                  element?.pc_platform === child?.pc_platform
              )
            );

            // 如果选中的当前游戏启动信息不在最新的平台列表中 并且不是自定义平台存在路径的情况
            if (!isFind && !(item?.path && item?.pc_platform === 0)) {
              // 如果平台列表存在除自定义以外的平台
              if (first) {
                select = { ...item, ...first };
              } else {
                // 如果平台列表只存在除自定义平台
                select = item?.platform?.[0];
              }
            }
          }

          return {
            ...item,
            ...select,
            platform: startGather,
          };
        }
        return item;
      });
    } else {
      assemble.push({
        ...value,
        id: option?.id,
        platform: startGather,
      });
    }
    console.log("储存的启动信息", assemble);

    // 存储游戏启动路径信息
    localStorage.setItem("startAssemble", JSON.stringify(assemble));
  };

  // 去重
  const removalFun = (list: any) => {
    // 对进程进行去重
    return list.filter((value: any, index: any, self: any) => {
      return self.indexOf(value) === index;
    });
  };

  // 通知客户端进行游戏加速
  const handleSuitDomList = async (option: any) => {
    try {
      let platform = await fetchPcPlatformList(); // 请求运营平台接口
      let WhiteBlackList = await fetchPcWhiteBlackList(); //请求黑白名单，加速使用数据
      let gameFiles = await queryPlatformGameFiles(platform, option); // 查询当前游戏在各个平台的执行文件 运行平台
      // 游戏本身的pc_platform为空时 执行文件运行平台默认为空 startGather 游戏启动平台列表
      let {
        executable,
        pc_platform,
        startGather,
        domain_blacklist,
        domain_list,
        ipv4_blacklist,
        ipv4_list,
        executable_blacklist,
      } = gameFiles;

      const storage: any = localStorage.getItem("startAssemble"); // 读取游戏启动路径信息
      const assemble = storage ? JSON.parse(storage) : []; // 游戏启动路径信息
      const current = assemble.find((child: any) => child?.id === option?.id); // 查找当前存储中是否存储过此游戏启动路径信息
      const customPath = current?.platform?.[0]?.path; // 当前游戏的自定义路径是否存在

      // 添加自定义类型数据
      startGather.unshift({
        pc_platform: 0,
        path: option?.scan_path
          ? option?.scan_path
          : customPath
          ? customPath
          : "", // 启动路径
        pid: "0", // 平台id
        name: "自定义", // 平台名称
      });

      // 处理加速时启动方式的数据更新
      assembleFun(option, startGather);

      // 同步加速平台的进程
      if (option?.pc_platform?.length > 0) {
        const gameResult = await queryGameIdByPlatform(
          option?.pc_platform,
          platform
        ); // 请求加速平台游戏
        const processResult = await triggerMultipleRequests(gameResult); // 聚合加速平台的进程

        executable = [...executable, ...processResult?.executable];
      }

      // 对进程进行去重
      const uniqueExecutable = executable.filter(
        (value: any, index: any, self: any) => {
          return self.indexOf(value) === index;
        }
      );

      const processBlack = JSON.parse(
        localStorage.getItem("processBlack") ?? "[]"
      ); // 进程黑名单
      console.log(option);

      // IP domain 黑白名单 executable 黑名单
      domain_blacklist = removalFun(domain_blacklist);
      domain_list = removalFun(domain_list);
      ipv4_blacklist = removalFun(ipv4_blacklist);
      ipv4_list = removalFun(ipv4_list);
      executable_blacklist = removalFun(executable_blacklist);

      // 假设 speedInfoRes 和 speedListRes 的格式如上述假设
      const {
        addr = "",
        server_v2 = [],
        id,
      } = option.serverNode.selectNode ?? {}; //目前只有一个服务器，后期增多要遍历
      const reqire = await validateRequiredParams({
        gid: option?.id,
        nid: id,
      });

      if (!reqire) {
        return;
      }

      const startInfo = await playSuitApi.playSpeedStart({
        platform: 3,
        gid: option?.id,
        nid: id,
      }); // 游戏加速信息
      const js_key = startInfo?.data?.js_key;

      if (startInfo?.error !== 0) {
        const url = "/api/v1/game/speed/start";

        tracking.trackBoostFailure(
          `server=${startInfo?.error};msg=${startInfo?.message?.slice(
            0,
            132
          )};apiName=${url};version=${clientVersion + "," + webVersion}`
        );
      }

      localStorage.setItem("StartKey", id);
      localStorage.setItem("speedIp", addr);
      localStorage.setItem("speedGid", option?.id);

      const jsonResult = JSON.stringify({
        running_status: true,
        accelerated_apps: [...uniqueExecutable],
        process_blacklist: [...processBlack, ...executable_blacklist],
        domain_blacklist: [
          ...(WhiteBlackList.blacklist.domain ?? []),
          ...domain_blacklist,
        ],
        ip_blacklist: [
          ...(WhiteBlackList.blacklist.ipv4 ?? []),
          ...ipv4_blacklist,
        ],
        domain_whitelist: [
          ...(WhiteBlackList.whitelist.domain ?? []),
          ...domain_list,
        ], // Assuming empty for now
        ip_whitelist: [...(WhiteBlackList.whitelist.ipv4 ?? []), ...ipv4_list], // Assuming empty for now
        acceleration_nodes: server_v2.map((s: any) => ({
          server_address: `${addr}:${s.port}`,
          protocol: s.protocol,
          acc_key: js_key,
        })),
      });

      // console.log(jsonResult);

      return new Promise((resolve, reject) => {
        (window as any).NativeApi_AsynchronousRequest(
          "NativeApi_StartProxy",
          "",
          async function (response: any) {
            console.log("是否开启真实加速(0成功)", response);
            const responseObj = JSON.parse(response); // 解析外层 response
            const restfulObj = responseObj?.restful
              ? JSON.parse(responseObj?.restful)
              : {}; // 解析内部 restful

            // 检查是否有 restful 字段，并解析为 JSON
            if (responseObj?.status === 0) {
              // 检查解析后的 restfulData 是否包含 port
              if (restfulObj?.port) {
                const url = `http://127.0.0.1:${restfulObj.port}/start`; // 拼接 URL
                const user_id = localStorage.getItem("userId"); // 用户id
                const localMchannel = localStorage.getItem("mchannel"); // mchannel 字段
                const token = localStorage.getItem("token");
                const client_token = localStorage.getItem("client_token");
                const client_id = localStorage.getItem("client_id");

                try {
                  // 发起 POST 请求，body 为 jsonResult
                  const result = await axios.post(url, jsonResult, {
                    headers: {
                      "Content-Type": "application/json",
                      "Client-version": clientVersion,
                      "Web-version": webVersion,
                      "User-id": user_id,
                      "User-token": token,
                      "Client-token": client_token,
                      "Client-id": client_id,
                      "Gid": option?.id,
                      Mchannel: localMchannel,
                    },
                  });

                  console.log("请求成功:", result.data);
                  if (result.data === "Acceleration started") {
                    resolve({ state: true, platform: pc_platform });
                    const time = localStorage.getItem("firstActiveTime");
                    const currentTime = Math.floor(Date.now() / 1000); // 当前时间
                    const isTrue = time && currentTime < Number(time);

                    tracking.trackBoostSuccess(isTrue ? 1 : 0);
                  } else {
                    stopAcceleration();
                    resolve({
                      state: false,
                      code: responseObj?.status,
                      message: responseObj?.error_log ?? "",
                    });
                  }
                } catch (error: any) {
                  console.log("请求失败:", error);
                  resolve({
                    state: false,
                    code: error?.code || "kpgcore错误",
                    message: responseObj?.error_log ?? "",
                  }); // 请求失败，返回错误信息
                }
              } else {
                console.error("端口信息缺失");
                resolve({
                  state: false,
                  code: responseObj?.status,
                  message: responseObj?.error_log ?? "",
                });
              }
            } else {
              console.error("响应数据缺失");
              resolve({
                state: false,
                code: responseObj?.status,
                message: responseObj?.error_log ?? "",
              });
            }
          }
        );
      });
    } catch (error) {
      console.log("实际加速函数错误", error);
      return false;
    }
  };

  const stopAnimation = () => {
    localStorage.removeItem("isAccelLoading"); // 删除存储临时的加速中状态
    setIsAllowAcceleration(true); // 启用立即加速
    setIsAllowShowAccelerating(true); // 启用显示加速中
    setIsStartAnimate(false); // 结束加速动画
  };

  // 加速实际操作
  const accelerateProcessing = async (event = selectAccelerateOption) => {
    let option = { ...event };
    const selectRegion = option?.serverNode?.selectRegion;

    const time = localStorage.getItem("firstActiveTime");
    const currentTime = Math.floor(Date.now() / 1000); // 当前时间
    const isTrue = time && currentTime < Number(time);
    const track = store.getState()?.auth?.boostTrack;
    console.log(track, isTrue);

    tracking.trackBoostStart(
      track === "result" ? "searchPage" : track,
      isTrue ? 1 : 0
    );

    stopAcceleration(); // 停止加速

    // 进行重新ping节点
    if ((window as any).fastestNode) {
      option = await (window as any).fastestNode(selectRegion, option);
    }

    const nodeHistory = option?.serverNode?.nodeHistory || [];
    const selectNode = nodeHistory.filter((item: any) => item?.is_select)?.[0];

    // 处理选中节点在某些特殊情况下key是null的时候，弹窗区服节点弹窗
    if (!selectNode?.key) {
      localStorage.removeItem("isAccelLoading"); // 删除存储临时的加速中状态
      setIsAllowAcceleration(true); // 启用立即加速
      setIsAllowShowAccelerating(true); // 启用显示加速中
      setIsStartAnimate(false); // 结束加速动画
      setIsOpenRegion(true);
      return;
    }

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

        if (isCheck?.status === 0) {
          const state: any = await handleSuitDomList(option); // 通知客户端进行加速

          if (state?.state) {
            accelerateGameToList(option, {
              acc_platform: state?.platform,
            }); // 加速完后更新我的游戏
            isPre = true;
          } else {
            tracking.trackBoostFailure(
              `client=${state?.code};msg=${state?.message?.slice(
                0,
                132
              )};version=${clientVersion + "," + webVersion}`
            );
            isPre = false;

            if (["ERR_NETWORK", "kpgcore错误"].includes(state?.state)) {
              await stopAcceleration();
            }

            eventBus.emit("showModal", {
              show: true,
              type: "infectedOrHijacked",
            });
          }
        } else {
          console.log(`不是合法文件，请重新安装加速器`);
          tracking.trackBoostFailure(
            `client=${isCheck?.status};version=${
              clientVersion + "," + webVersion
            }`
          );
          isPre = false;
          eventBus.emit("showModal", {
            show: true,
            type: "infectedOrHijacked",
          });
        }

        setTimeout(() => {
          stopAnimation();

          if (isPre) {
            navigate("/gameDetail", { state: { fromRefresh: true } });
          }
        }, 1000);
      }
    );
  };

  // 点击立即加速 执行加速前校验函数
  const handleBeforeVerify = async (option: any) => {
    try {
      // 是否登录
      if (accountInfo?.isLogin) {
        const latestAccountInfo = store.getState().accountInfo; // 登录信息
        const find_accel = identifyAccelerationData(); // 查找是否有已加速的信息
        const isLockArea = option?.is_lockout_area; // 是否锁区
        // 当前历史选择区服
        const selectRegion = option?.serverNode?.selectRegion;

        // 锁区 是否是第一次加速弹窗区服节点
        if (isLockArea && !selectRegion) {
          setRegionType(store.getState().auth?.boostTrack);
          setIsOpenRegion(true);
          setSelectAccelerateOption(option);
          return;
        }

        // 是否有加速中的游戏
        if (find_accel?.[0] && option?.router !== "details") {
          setAccelOpen(true);
          setSelectAccelerateOption(option);
          return;
        }

        localStorage.setItem("isAccelLoading", "1"); // 存储临时的加速中状态

        if (latestAccountInfo) {
          const userInfo = latestAccountInfo?.userInfo; // 用户信息
          const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息

          // 是否实名认证 isRealNamel === "1" 是
          // 是否是未成年 is_adult
          if (isRealNamel === "1") {
            stopAnimation();
            dispatch(openRealNameModal());
            return;
          } else if (!userInfo?.user_ext?.is_adult) {
            stopAnimation();
            dispatch(setMinorState({ open: true, type: "acceleration" })); // 实名认证提示
            return;
          }

          // 应用存储的版本信息 and window挂载的当前客户端版本
          const version = JSON.parse(
            localStorage.getItem("version") ?? JSON.stringify({})
          );
          const clientVersion = (window as any).versionNowRef;

          // 比较版本是否需要升级
          const isInterim = compareVersions(
            clientVersion,
            version?.min_version
          );

          // 如果版本有升级并且 版本没有选择更新 并且弹窗是未打开的情况下
          if (isInterim && !versionOpen) {
            // 打开升级弹窗 触发普通升级类型
            dispatch(setVersionState({ open: true, type: "force" }));
            stopAnimation(); // 停止加速动画
            return;
          }

          setIsAllowAcceleration(false); // 禁用立即加速
          setIsAllowShowAccelerating(false); // 禁用显示加速中
          setIsStartAnimate(true); // 开始加速动画

          // 是否下架
          let shelves = await checkShelves(option);
          let data = { ...option };

          // 判断是否当前游戏下架
          if (shelves?.state) {
            stopAnimation();
            return;
          }
          if (shelves?.data) data = shelves?.data; // 如果游戏数据有更新，则进行更新

          data = await checkGameisFree(data, "card"); // 查询当前游戏是否限时免费并更新数据

          // 是否是vip
          // 是否限时免费 free_time
          if (!(option?.free_time) && !userInfo?.is_vip) {
            stopAnimation();
            eventBus.emit("showModal", {
              show: true,
              type: "serviceExpired",
            });
            return;
          }

          // 如果不是锁区的情况下
          if (!isLockArea && !selectRegion) {
            data = (await renderHistoryAreaSuit(data))?.data;
          }

          setSelectAccelerateOption(data);
          accelerateProcessing(data);
        } else {
          stopAnimation();
          (window as any).loginOutStopWidow(); // 退出登录
          dispatch(setAccountInfo(undefined, undefined, true)); // 未登录弹出登录框
        }
      } else {
        localStorage.removeItem("isAccelLoading");
        dispatch(setAccountInfo(undefined, undefined, true)); // 未登录弹出登录框
      }
    } catch (error) {
      console.log("游戏卡片错误", error);
      localStorage.removeItem("isAccelLoading");
    } finally {
      setIsVerifying(false);
    }
  };

  // 确认开始加速
  const confirmStartAcceleration = async () => {
    setAccelOpen(false); // 关闭确认框
    tracking.trackBoostDisconnectManual();

    const list = await stopAcceleration(); // 停止加速

    handleBeforeVerify({ ...list });
  };

  // 打开区服节点
  const handleRegsion = async (
    event: React.MouseEvent<HTMLImageElement>,
    option: any
  ) => {
    event.stopPropagation();

    if (accountInfo?.isLogin) {
      event.stopPropagation();
      setRegionType(locationType);
      setIsOpenRegion(true);
      setSelectAccelerateOption(option);
    } else {
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  };

  // 点击游戏卡片
  const handleGameCard = (option: any) => {
    try {
      setIsVerifying(true);
      if (isVerifying) return; // 防止进行多次点击
      if (localStorage.getItem("isAccelLoading") === "1") {
        // 触发游戏在加速中提示
        eventBus.emit("showModal", {
          show: true,
          type: "gamesAccelerating",
        });
      }

      // 如果是游戏库 结果页
      if (["library", "result", "myGame"].includes(locationType)) {
        const data = appendGameToList(option);
        const optionParams =
          data.filter((item: any) => item?.id === option?.id)?.[0] || {};

        // 跳转到首页并触发自动加速autoAccelerate
        navigate("/home", {
          state: {
            isNav: true,
            data: {
              ...optionParams,
              router: "home",
              track: locationType,
            },
            autoAccelerate: true,
          },
        });
      } else {
        handleBeforeVerify({ ...option, router: "home" });
      }
    } catch (error) {
      setIsVerifying(false);
    }
  };

  // 添加游戏
  const handleAddGame = (event: any, option: any) => {
    event.stopPropagation();
    appendGameToList(option);
    navigate("/home");
  };

  // 清除游戏
  const handleClearGame = (event: any, option: any) => {
    // 已从本地扫描并且从我的游戏中删除的游戏
    const scannedLocal = JSON.parse(
      localStorage.getItem("scannedLocal") || JSON.stringify([])
    );

    event.stopPropagation();
    removeGameList(option);
    triggerDataUpdate(); // 更新首页展示

    // 如果这个游戏是扫描来的然后再清除，存储到本地扫描清除列表数据中
    if (option?.mark === "local") {
      localStorage.setItem(
        "scannedLocal",
        JSON.stringify([...scannedLocal, option])
      );
    }
  };

  // 如果有自定义的加速数据 则替换选择加速数据 并且进行加速
  useEffect(() => {
    if (Object.keys(customAccelerationData)?.length > 0) {
      setIsVerifying(true);
      console.log(customAccelerationData?.track);
      
      dispatch(setBoostTrack(customAccelerationData?.track));
      handleBeforeVerify(customAccelerationData);
    }

    (window as any).handleSuitDomList = handleSuitDomList;
  }, [customAccelerationData]);

  return (
    <div
      className={`game-card-module ${
        (areaStyleClass as any)?.[locationType] + "-game-card-module"
      }`}
      ref={bindRef}
      onScroll={onScroll}
    >
      {options?.map((option: any) => {
        const free = option?.free_time; // 限免时间
        const isFree = ["library"].includes(locationType); // 是否显示限免标签
        const isSearchR = ["library", "result"].includes(locationType); // 是否显示 副标题 添加icon
        const isAccelLoading = localStorage.getItem("isAccelLoading"); // 是否加速中的标记
        const isPermitA = isAccelLoading !== "1" && isAllowAcceleration; // 是否允许触发加速状态
        const isALoading =
          isStartAnimate && selectAccelerateOption?.id === option?.id; // 是否执行加速中动画

        return (
          <div className={`game-card`} key={option?.id}>
            <img
              className="background-img"
              src={option?.cover_img ?? iniliteCardIcon}
              alt={iniliteCardIcon}
              onError={(e: any) => {
                e.target.onerror = null; // 防止错误循环
                e.target.src = iniliteCardIcon;
              }}
            />
            {/* 立即加速卡片 */}
            {isPermitA && (
              <div
                className="accelerate-immediately-card"
                onClick={() => {
                  dispatch(setBoostTrack(locationType));
                  handleGameCard(option);
                }}
              >
                <img className="mask-layer-img" src={accelerateIcon} alt="" />
                <div className="accelerate-immediately-button">
                  <span className="accelerate-immediately-text">立即加速</span>
                  <img
                    className="accelerate-immediately-img"
                    src={arrowIcon}
                    alt=""
                  />
                </div>
                {isSearchR && (
                  <img
                    className="add-img"
                    src={addThemeIcon}
                    alt=""
                    onClick={(event) => {
                      handleAddGame(event, option);
                    }}
                  />
                )}
                {!isSearchR && (
                  <img
                    className="select-img"
                    src={select}
                    alt=""
                    onClick={(event) => {
                      dispatch(setBoostTrack(locationType));
                      handleRegsion(event, option);
                    }}
                  />
                )}
                {!isSearchR && (
                  <img
                    className="clear-img"
                    src={closeIcon}
                    alt=""
                    onClick={(event) => handleClearGame(event, option)}
                  />
                )}
              </div>
            )}
            {/* 加速动画卡片 */}
            {isALoading && (
              <div className={"accelerate-animate-card"}>
                <div className={"animate-text"}>加速中...</div>
                <div
                  className={`accelerate-animate ${
                    isStartAnimate && "accelerate-animate-start"
                  }`}
                />
              </div>
            )}
            {/* 加速中卡片 */}
            {locationType === "home" &&
            isAllowShowAccelerating &&
            option?.is_accelerate ? (
              <div
                className="accelerating-card"
                onClick={
                  () =>
                    navigate("/gameDetail", {
                      state: {
                        fromRefresh: identifyAccelerationData()?.[0]
                          ? false
                          : true,
                      },
                    }) // 通过判断当前是否有游戏加速，判断进入详情是否是第一次
                }
              >
                <img
                  className="accelerating-content-img"
                  src={acceleratedIcon}
                  alt=""
                />
                <div className="accelerating-content">
                  {locationType === "home" && (
                    <>
                      <div className="instant-delay">实时延迟</div>
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
                      localStorage.setItem("stopActive", "1");
                      setStopModalOpen(true);
                    }}
                  >
                    <img src={cessationIcon} width={18} height={18} alt="" />
                    <span>停止加速</span>
                  </div>
                </div>
              </div>
            ) : null}
            {isFree && free && (
              <div className="exemption-box">
                <div className="exemption">限免</div>
                {free !== "永久" && <div className="time">剩余 {free}</div>}
              </div>
            )}
            <div className="game-card-name">
              <div className="card-name-zh">{option?.name}</div>
              {isSearchR && (
                <div className="card-name-en">
                  {option.note ? option.note : `${option.name_en}`}
                </div>
              )}
            </div>
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
        type={regionType}
        options={selectAccelerateOption}
        onCancel={() => {
          triggerDataUpdate();
          setIsOpenRegion(false);
        }}
        notice={(e) => handleBeforeVerify(e)}
      />
      {/* 续费提醒确认弹窗 */}
      {renewalOpen ? (
        <BreakConfirmModal
          accelOpen={renewalOpen}
          type={"renewalReminder"}
          setAccelOpen={setRenewalOpen}
          onConfirm={() => {
            setRenewalOpen(false);
            dispatch(setPayState({ open: false, couponValue: {} })); // 关闭会员充值页面
          }}
        />
      ) : null}
    </div>
  );
};

export default GameCard;
