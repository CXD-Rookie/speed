import React, { useEffect, useState, useRef } from "react";
import { Layout } from "antd";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { setAccountInfo } from "@/redux/actions/account-info";
import { validateRequiredParams } from "@/common/utils";
import {
  setDrawVipActive,
  setFirstPayRP,
  setMinorState,
  setAppCloseOpen,
  setSetting,
  setVersionState,
  setLocalGameState,
  setNewUserOpen,
} from "@/redux/actions/modal-open";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { setFirstAuth } from "@/redux/actions/firstAuth";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { setupInterceptors } from "@/api/api";
import { getMidnightTimestamp } from "@/containers/currency-exchange/utils";
import {
  compareVersions,
  stopProxy,
  serverClientReport,
  exceptionReport
} from "./utils";

import "./index.scss";
import routes from "@/routes";
import loginApi from "@/api/login";
import gameApi from "@/api/gamelist"
import playSuitApi from "@/api/speed";
import LayoutHeader from "./layout-header";
import RenderSrea from "./render-area";
import tracking from "@/common/tracking";
import eventBus from "@/api/eventBus";
import useFetchBanner from "@/hooks/useFetchBanner";
import webSocketService from "@/common/webSocketService";

const { Header, Content } = Layout;

const Layouts: React.FC = () => {
  const routeView = useRoutes(routes); // 获得路由表
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: any = useDispatch();
  const versionNowRef = useRef("1.0.0.1002"); // 客户端版本绑定

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  const { open: versionOpen = false } = useSelector(
    (state: any) => state?.modalOpen?.versionState
  );
  const { open: landPayOpen = false } = useSelector(
    (state: any) => state?.modalOpen?.firstPayRP
  ); // 首次充值引导页
  const newUserOpen = useSelector((state: any) => state?.modalOpen?.newUserOpen); // 新用户引导页
  
  const historyContext: any = useHistoryContext(); // 自定义传递上下文 hook
  const {
    removeGameList,
    identifyAccelerationData,
    getGameList,
    passiveAddition,
  } = useGamesInitialize();
  const { fetchBanner } = useFetchBanner(); // 请求banner图 hook

  const [couponRefreshNum, setCouponRefreshNum] = useState(0); // 是否刷新优惠券过期判断

  const handleMouseDown = () => {
    (window as any).NativeApi_OnDragZoneMouseDown();
  };

  const handleMouseUp = () => {
    (window as any).NativeApi_OnDragZoneMouseUp();
  };

  // 读取客户端版本方法
  const nativeVersion = () => {
    return new Promise((resolve, rejects) => {
      (window as any).NativeApi_AsynchronousRequest(
        "QueryCurrentVersion",
        "",
        (response: string) => {
          const version = JSON.parse(response)?.version;
          
          // 成功返回当前版本
          if (version) {
            versionNowRef.current = version;
            (window as any).versionNowRef = version; // 将版本挂载到window，强制升级处使用
            resolve({ state: true, version });
          } else {
            // 失败返回最低版本
            rejects({ state: true, version: versionNowRef?.current });
          }
        }
      );
    })
  };

  // 初始设置
  const initialSetup = () => {
    return new Promise((resolve, rejects) => {
      try {
        let clientSetup = localStorage.getItem("client_settings");
        let setup = clientSetup ? JSON.parse(clientSetup) : {}; // 尝试解析 client_settings

        // 设置 close_button_action 的值，如果不存在则添加
        if (!setup?.close_button_action) {
          setup.close_button_action = 0; // 1 表示关闭程序，0 表示隐藏到托盘
        }

        // 更新或者设置 client_settings
        localStorage.setItem("client_settings", JSON.stringify(setup));
        resolve({state: true})
      } catch (error) {
        console.log("初始化设置", error);
        rejects({ state: false });
      }
    })
  };

  // 进程黑名单
  const initialProcessBlack = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const reqire = await validateRequiredParams();

        if (!reqire) {
          return;
        }

        const res = await playSuitApi.playProcessblacklist();
        const data = (res?.data || []).flatMap((item: any) => item.process);

        localStorage.setItem("processBlack", JSON.stringify(data));
      }
    } catch (error) {
      console.log("进程黑名单", error);
    }
  };

  // 获取游戏列表接口
  const fetchGameList = async (params: any = {}) => {
    try {
      const res = await gameApi.gameList(params);
      return res?.data?.list ?? [];
    } catch (error) {
      console.log(error);
    }
  }

  // 缓存游戏函数
  const cacheGameFun = async () => {
    return new Promise(async (resolve, reject) => {
      const filtration = (list: any) => {
        list = list?.map((value: any) => {
          const src = value?.cover_img || value.background_img;
          const url = "https://cdn.accessorx.com/";

          return {
            ...value,
            cover_img: url + src,
          };
        });

        return list || [];
      };
      const [allGame, freeGame, hotGame, newGame, chinaGame]: any =
        await Promise.all([
          await fetchGameList(), // 所有游戏
          await fetchGameList({ type: "free" }), // 限时免费
          await fetchGameList({ type: "hot", page: 1, pagesize: 30 }), // 热门游戏
          await fetchGameList({ type: "new", page: 1, pagesize: 30 }), // 最新推荐
          await fetchGameList({ type: "china_game_server" }), // 国服游戏
        ]);
      const result = {
        allGame: filtration(allGame),
        freeGame: filtration(freeGame),
        hotGame: filtration(hotGame),
        newGame: filtration(newGame),
        chinaGame: filtration(chinaGame),
      };

      if (allGame?.length > 0) {
        localStorage.setItem("cacheGame", JSON.stringify(result)); // 缓存到 localStorage
      }
      
      resolve(result); // 暴露游戏返回值
    })
  }

  // 初始化更新游戏
  const iniliteRenewal = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const [list, data]: any =
          await Promise.all([
            await stopProcessReset(), // 初始化调用停止加速
            await cacheGameFun(), // 更新缓存游戏，并且导出返回值
          ]);
        const allGame = data?.allGame;

        // 传递数据给客户端，以用来进行游戏扫描
        (window as any).NativeApi_AsynchronousRequest(
          "SetGameData",
          JSON.stringify({ list: allGame }),
          () => {}
        );

        const meGame: any = list?.data ?? [];
        const result = meGame.map((item: any) => {
          // 如果找到此游戏
          const target = allGame?.find(
            (child: any) => child?.id === item?.id
          );

          // 如果找到此游戏并且更新时间发生改变
          if (target?.id && target?.update_time !== item?.update_time) {
            console.log("update_time:", target);
            
            return {
              ...item,
              ...target,
              cover_img: `${target?.cover_img ?? target.background_img}`,
            };
          } else if (target?.id) {
            if (target?.cover_img !== item?.cover_img) {
              console.log("cover_img:", target);

              return {
                ...item,
                cover_img: `${target?.cover_img ?? target.background_img}`,
              };
            } else {
              return item;
            }
          }
        });

        const filteredArray = result.filter((item: any) => {
          // 检查 item 是否为 undefined 或 null
          if (item === undefined || item === null) {
            return false;
          }
          // 检查 item 是否为空对象 {}
          if (
            typeof item === "object" &&
            item !== null &&
            Object.keys(item).length === 0
          ) {
            return false;
          }
          // 其他情况保留
          return true;
        });

        localStorage.setItem(
          "speed-1.0.0.1-games",
          JSON.stringify(filteredArray)
        );

        navigate("/home");
        resolve({ state: true, list: filteredArray });
      } catch (error) {
        console.log("初始化更新游戏", error);
        reject({state: false, list: []});
      }
    })
  };

  // 定义停止加速应该做的操作
  // 可接收 value 做关闭，退出操作 exit
  const stopProcessReset = async (value: any = "") => {
    return new Promise(async (resolve, reject) => {
      try {
        if (localStorage.getItem("isAccelLoading") === "1") {
          return; // 如果退出时游戏还在加速中，则暂不处理，停止向下执行
        }

        // 上报埋点
        if (value === "exit" && identifyAccelerationData()?.[0]) {
          tracking.trackBoostDisconnectManual();
        }

        await stopProxy(value); // 调用停止加速
        const game = await removeGameList("initialize"); // 更新我的游戏

        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        if (value === "exit") {
          (window as any).NativeApi_ExitProcess();
        }

        navigate("/home");
        resolve({ state: true, data: game });
      } catch (error) {
        reject({state: false}); // 失败
      }
    });
  };

  // 全局只给客户端调用，业务不处理,是到托盘之后邮件 弹出的关闭按钮的方法
  const stopSpeed = () => {
    if (identifyAccelerationData()?.[0]) {
      (window as any).NativeApi_ShowWindow(); // 唤醒主程序客户端方法
      eventBus.emit("showModal", { show: true, type: "exit" }); // 弹出关闭确认框
    } else {
      if (localStorage.getItem("isAccelLoading") !== "1") {
        stopProcessReset("exit"); // 关闭主程序
        (window as any).NativeApi_ExitProcess();
      }
    }
  };

  // 客户端调用托盘区
  const trayAreaControls = () => {
    let close = localStorage.getItem("client_settings");
    let action = close ? JSON.parse(close)?.close_button_action : 2;

    //0 最小化托盘 1 关闭主程序 2 或没值弹窗提示框
    if (action === 0) {
      (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
    } else if (action === 1 && identifyAccelerationData()?.[0]) {
      eventBus.emit("showModal", { show: true, type: "exit" }); // 弹出关闭确认框
    } else {
      dispatch(setAppCloseOpen(true)); // app 关闭窗口
    }
  };

  // 退出登录
  const loginOut = async (event: any = "") => {
    try {
      if (identifyAccelerationData()?.[0]) {
        tracking.trackBoostDisconnectManual();
      }
      
      webSocketService.close({
        code: 4000,
        reason: "退出登录后主动关闭",
      });

      try {
        await stopProcessReset(); // 单独 try-catch 处理加速停止
      } catch (error) {
        console.error("停止加速失败:", error);
      }

      try {
        await loginApi.loginOut(); // 单独 try-catch 处理登出请求
      } catch (error) {
        console.error("登出请求失败:", error);
      }

      try {
        await fetchBanner(); // 单独 try-catch 处理 banner 更新
      } catch (error) {
        console.error("更新banner失败:", error);
      }

      // await stopProcessReset(); // 停止加速操作
      // await loginApi.loginOut(); // 调用退出登录接口，不需要等待返回值
      // await fetchBanner(); // 退出登录更新banner图

      localStorage.removeItem("token");
      localStorage.removeItem("isRealName"); // 去掉实名认证
      localStorage.removeItem("userId"); // 存储user_id
      dispatch(setAccountInfo({}, false, true)); // 修改登录状态
      
      console.log("退出登录");
      if (event === "remoteLogin") {
        dispatch(setMinorState({ open: true, type: "remoteLogin" })); // 异地登录
      }

      if (event === "api") {
        setTimeout(() => {
          navigate("/home")
        }, 200);
      }
      // if (event === 1) {
      //   setReopenLogin(true); 暂时未发现什么地方调用，先做注释
      // }
    } catch (error) {
      console.log("退出登录", error);
    }
  };

  // 本地扫描游戏方法
  const invokeLocalScan = async (option: any = [], isTootip: boolean = true) => {
    try {
      let all = []; // 扫描到的游戏

      // 接收的参数是数据并且有数据的情况下
      if (Array.isArray(option) && option?.length > 0) {
        const allApi: any = [];

        // 做接口请求组合
        option.forEach((element) => {
          allApi.push(
            gameApi.gameList({ s: element?.name }).then((res: any) => {
              const result = res?.data?.list?.[0];
              return result
                ? {
                    ...result,
                    mark: "local", // 标记这个游戏是本地扫描到的
                    scan_path: element?.path, // 扫描到的本地游戏路径
                    cover_img: `https://cdn.accessorx.com/${
                      result.cover_img
                        ? result.cover_img
                        : result.background_img
                    }`,
                  }
                : false;
            })
          );
        });

        all = await Promise.all(allApi); // 请求接口
        all = all.filter((item) => item !== false); // 去除布尔值为false的元素
      }

      // 已从本地扫描并且从我的游戏中删除的游戏
      const scannedLocal = JSON.parse(
        localStorage.getItem("scannedLocal") || JSON.stringify([])
      );
      const meGame = getGameList(); // 我的游戏
      const allowAdd = all.filter(
        (item: any) =>
          scannedLocal.every((child: any) => child?.id !== item?.id) &&
          meGame.every((child: any) => child?.id !== item?.id)
      ); // 既不是已经标记过的游戏，也不是在我的游戏中的游戏
      const storeScanned = JSON.parse(
        localStorage.getItem("storeScanned") ?? JSON.stringify([])
      ); // 存储扫描到的游戏
      const store = [...storeScanned];

      // console.log(
      //   "已经存在的本地扫描游戏: ",
      //   storeScanned,
      //   "新扫描到的游戏:",
      //   allowAdd,
      //   "当前游戏是否允许弹出:",
      //   isTootip
      // );

      if (allowAdd?.length > 0) {
        // 从前添加，从后删除，最多只保留2个展示的扫描游戏
        [...allowAdd].forEach((item: any) => {
          store.unshift(item); // 扫描展示添加
          passiveAddition(item); // 添加到我的游戏

          if (store?.length > 1) {
            store.slice(2, store?.length);
          }
        });
        
        const localStore = store.slice(0, 2); // 只允许展示2个，且本地应用存储最多2个
        const path = window?.location?.hash.split("#");
        
        console.log("展示的扫描游戏:", localStore, path);
        navigate(path?.[1]);
        localStorage.setItem("storeScanned", JSON.stringify(localStore)); // 本地储存用于展示扫描弹出的数据
        
        // 在首页并且允许弹出的情况下弹出提醒游戏弹窗
        if (isTootip) {
          // 弹出扫描游戏弹窗
          dispatch(setLocalGameState({ open: true, value: localStore }));
        } else {
          localStorage.removeItem("storeScanned");
        }
      }
    } catch (error) {
      console.log("本地扫描游戏方法", error);
    }
  }

  // 判断是否弹出首续或者首充引导页
  const landFirstTrigger = async () => {
    const time = new Date().getTime() / 1000; // 获取当前时间
    const mid_time = getMidnightTimestamp(time);
    const local_time = localStorage.getItem("localTimeLock"); // 当天时间锁
    const banner = JSON.parse(localStorage.getItem("all_data") || "[]"); // banner图数据

    console.log("当前时间", time, "当前存储时间锁", Number(local_time), banner);
    if (
      (time > Number(local_time) && !landPayOpen) ||
      !Number(local_time)
    ) {
      const find = (banner || [])?.find((item: any) => ["2", "3"].includes(item?.params));
      const renewed = find?.params === "2"; // 首充
      const purchase = find?.params === "3"; // 首续

      localStorage.setItem("localTimeLock", String(mid_time)); // 触发弹窗记录当天0点时间锁

      // 标记弹窗已展示
      if (renewed && !purchase) {
        dispatch(setFirstPayRP({ open: true, type: 2 }));
        return;
      }

      if (!renewed && purchase) {
        dispatch(setFirstPayRP({ open: true, type: 3 }));
        return;
      }
    }
  };

  const schedulePolling = (event: any) => {
    if (event?.data) {
      const data = JSON.parse(event.data);
      const token = localStorage.getItem("token");
      const isClosed = localStorage.getItem("isClosed"); // 做删除
      const banner = JSON.parse(localStorage.getItem("all_data") || "[]"); // banner图数据
      const purchase = JSON.parse(
        localStorage.getItem("first_purchase") || "[]"
      ); // 首次充值
      const renewal = JSON.parse(localStorage.getItem("first_renewal") || "[]"); // 首次续费
      const newUser = JSON.parse(localStorage.getItem("new_user") || "[]"); //首次登录的活动
      const isModalDisplayed =
        localStorage.getItem("isModalDisplayed") === "true"; // 获取localStorage中是否展示过标志
      const isNewUser = localStorage.getItem("is_new_user") === "true"; // 是否新用户
      const {
        version = "", // 版本
        user_info = {}, // 用户信息
        timestamp = 0, // 服务端时间
        first_purchase_renewed = {}, // 是否首充首续
      } = data?.data;
      
      if (token) {
        localStorage.setItem("userId", user_info?.id); // 存储user_id
        // 存储版本信息
        localStorage.setItem("version", JSON.stringify(version));

        // isClosed异地登录被顶掉标记 升级版本比较
        // 升级弹窗要在登录之后才会弹出
        if (!isClosed && version) {
          // 普通升级版本和客户端当前版本进行比较
          const isInterim = compareVersions(
            versionNowRef.current,
            version?.now_version
          );

          // 如果普通版本升级没有更新，删除版本比较信息锁，避免导致后续比较信息读取错误
          // 反之进行 else 进行版本比较
          if (!isInterim) {
            localStorage.removeItem("versionLock"); // 删除
            dispatch(setVersionState({ open: false, type: "" })); // 关闭版本升级弹窗
          } else {
            // 版本比较信息锁
            const versionLock = JSON.parse(
              localStorage.getItem("versionLock") ?? JSON.stringify({})
            );

            // 由于当前版本存在可升级版本时，但是没有选择升级，此时又更新了一个版本进入此判断逻辑
            if (versionLock?.interimVersion) {
              const isInterim = compareVersions(
                versionLock?.interimVersion,
                version?.now_version
              );

              // 如果版本有升级并且版本没有进行更新并且弹窗是未打开的情况下
              if (isInterim && !versionOpen) {
                // 打开升级弹窗 触发普通升级类型
                dispatch(setVersionState({ open: true, type: "last" }));
              }

              localStorage.setItem(
                "versionLock", // 普通升级版本信息 是否升级标记 interimMark
                JSON.stringify({
                  interimVersion: version?.now_version,
                  interimMark: "1", // "1" 表示未升级
                })
              );
            } else {
              // 当前版本存在可升级版本时 属于过渡版本判断
              // 普通升级版本和客户端当前版本进行比较
              const isInterim = compareVersions(
                versionNowRef.current,
                version?.now_version
              );

              // 如果版本有升级并且 版本没有选择更新 并且弹窗是未打卡的情况下
              if (
                isInterim &&
                versionLock?.interimMark !== "1" &&
                !versionOpen
              ) {
                localStorage.setItem(
                  "versionLock", // 普通升级版本信息 是否升级标记 interimMark
                  JSON.stringify({
                    interimVersion: version?.now_version,
                    interimMark: "1", // "1" 表示未升级
                  })
                );
                // 打开升级弹窗 触发普通升级类型
                dispatch(setVersionState({ open: true, type: "interim" }));
              }
            }
          }
        }

        if (String(data?.code) === "0") {
          const { user_ext = {} } = user_info;
          const couponTimeLock = localStorage.getItem("couponTimeLock") || 0; // 获取刷新优惠券的时间锁
          const {
            first_purchase: isPurchase = false, // 是否首充
            first_renewed: isRenewed = false, // 是否首续
          } = first_purchase_renewed;
          let firstPAndR = banner.filter((item: any) => {
            return !newUser.some(
              (newItem: any) => newItem.image_url === item.image_url
            );
          }); // 去除新用户数据

          localStorage.removeItem("isClosed"); // 删除标记
          localStorage.setItem("timestamp", timestamp); // 存储服务端时间
          dispatch(setFirstAuth(first_purchase_renewed)); // 更新首充首续信息

          // 根据 isPurchase isRenewed 的状态进行筛选
          if (isPurchase && !isRenewed) {
            firstPAndR = purchase; // 赋值首充的数据
          } else if (!isPurchase && isRenewed) {
            firstPAndR = renewal; // 赋值首续的数据
          } else if (!isRenewed && !isRenewed) {
            firstPAndR = []; // 赋值 []
          }
          const isQQ = banner.find((value: any) => value?.params === "0") ?? {};
          
          if (isQQ?.params) {
            firstPAndR.unshift(isQQ);
          }
          // 更新 localStorage 中的 all_data
          localStorage.setItem("all_data", JSON.stringify(firstPAndR));
          // 通过 eventBus 通知更新
          eventBus.emit("dataUpdated", firstPAndR);

          if (banner?.length > 0 && store?.getState()?.accountInfo?.isLogin) {
            const isNewOpen = store?.getState()?.modalOpen?.drawVipActive?.open; // 新用户领取弹窗

            // 是新用户 没有点击过新用户弹窗 新用户弹窗是否打开
            if (isNewUser && !isModalDisplayed && !isNewOpen) {
              // 判断是否为新用户且弹窗尚未展示过，并且 data.user_info 是一个非空对象
              setTimeout(() => {
                dispatch(setDrawVipActive({ open: true }));
              }, 500);
            }
          }

          // 如果当前时间大于索时间触发优惠券弹窗
          if (timestamp > Number(couponTimeLock)) {
            setCouponRefreshNum(couponRefreshNum + 1);
          }

          // 实名认证
          if (!user_ext?.name && !user_ext?.idcard) {
            localStorage.setItem("isRealName", "1");
          } else {
            localStorage.setItem("isRealName", "0");
          }
        }

        dispatch(setAccountInfo(user_info, true, false));
      }
    }
  };

  // 初始化操作
  const iniliteAppFun = async () => {
    return new Promise(async (resolve, reject) => {
      const url = process.env.REACT_APP_WSAPI_URL || "";

      localStorage.removeItem("storeScanned"); // 关闭时清除扫描游戏存储
      localStorage.removeItem("eventBuNetwork"); // 删除网络错误弹窗标记
      
      fetchBanner();
      
      if (!accountInfo.isLogin) {
        const time = new Date().getTime() / 1000; // 获取当前时间
        const local_time = localStorage.getItem("newUserTimeLock"); // 新用户引导页当天时间锁对象
        const lock = JSON.parse(local_time || JSON.stringify({})); // 解构数据
        const lock_time = getMidnightTimestamp(time); // 当天0点时间锁
        
        if (
          Object.keys(lock)?.length === 0 ||
          (!lock?.isLogin && // 是否登录过
          time > Number(lock?.time) &&
          !newUserOpen)
        ) {
          dispatch(setNewUserOpen(true)); // 触发弹窗
          localStorage.setItem(
            "newUserTimeLock",
            JSON.stringify({ ...lock, time: lock_time })
          ); // 存储锁
        }
      }

      webSocketService.connect(
        url, // 请求环境
        (event: MessageEvent) => schedulePolling(event),
        dispatch
      );
      
      const [renewal, version, setting]: any = await Promise.all([
        iniliteRenewal(), // 初始化更新游戏;
        nativeVersion(), // 读取客户端版本
        initialSetup(), // 初始设置
      ]);
      
      if (accountInfo.isLogin) {
        await landFirstTrigger();
      }
    
      if (renewal?.state && version?.state && setting?.state) {
        resolve({
          state: true,
          data: {
            version: version?.version,
          },
        });
      }
    })
  }
  
  // 在登录状态发生变化时
  useEffect(() => {
    let intervalId: any = null;
    
    // 请求全局黑名单 清除banner图计时器
    if (accountInfo?.isLogin) {
      initialProcessBlack(); // 初始进程黑名单
      clearInterval(intervalId);

      if ((window as any).clearBannerTimer) {
        (window as any).clearBannerTimer();
      }
    } else {
      // 获取 banner 图逻辑 3小时定时请求一次
      intervalId = setInterval(() => fetchBanner(), 10800000);
      (window as any).clearBannerTimer = () => clearInterval(intervalId);
    }

    // 清理函数，在组件卸载前清除定时器
    return () => {
      clearInterval(intervalId);

      if ((window as any).clearBannerTimer) {
        (window as any).clearBannerTimer();
      }
    };
  }, [accountInfo.isLogin]);

  // 用于给api.js传递 hook,在 10001时可以做清除 hook 调用处理
  useEffect(() => {
    setupInterceptors({
      historyContext,
      removeGameList,
    });
  }, [historyContext, removeGameList]);

  // 在应用启动时挂载方法到 window 对象上
  useEffect(() => {
    (window as any).speedError = serverClientReport; // 客户端使用，业务不处理，用于判断加速异常的提示使用
    (window as any).speedErrorReport = exceptionReport; // 客户端使用，异常原因上报
    (window as any).stopProcessReset = stopProcessReset; // 停止加速后应该更新的数据
    (window as any).stopSpeed = stopSpeed; // 客户端调用，业务不处理,托盘弹出的关闭按钮的方法
    (window as any).loginOutStopWidow = loginOut; // 退出登录操作函数
    (window as any).closeTypeNew = trayAreaControls; // 客户端调用托盘区
    (window as any).showSettingsForm = () =>
      dispatch(setSetting({ settingOpen: true, type: "default" })); // 客户端调用设置方法
    (window as any).invokeLocalScan = invokeLocalScan; // 客户端调用扫描本地游戏方法
    (window as any).cacheGameFun = cacheGameFun; // 内部使用更新缓存游戏
    (window as any).landFirstTrigger = landFirstTrigger; // 调用引导页弹窗

    // 清理函数，在组件卸载时移除挂载
    return () => {
      delete (window as any).landFirstTrigger;
      delete (window as any).cacheGameFun;
      delete (window as any).speedErrorReport;
      delete (window as any).invokeLocalScan;
      delete (window as any).speedError;
      delete (window as any).stopProcessReset;
      delete (window as any).stopSpeed;
      delete (window as any).loginOutStopWidow;
      delete (window as any).closeTypeNew;
      delete (window as any).showSettingsForm;
    };
  }, []);
  
  useEffect(() => {
    const webVersion = process.env.REACT_APP_VERSION;
    const clientVersion = (window as any).versionNowRef;

    const handleGlobalError = (event: any) => {
      // console.log("Global error handler:", event);
      if (
        event.message === "Network Error" ||
        (event.error && event.error.message === "Network Error")
      ) {
        tracking.trackNetworkError(
          `errorCode=${event.error};version=${clientVersion + "," + webVersion}`
        );
        eventBus.emit("showModal", { show: true, type: "netorkError" });
        event.preventDefault(); // 阻止默认处理
      }
    };

    const handleUnhandledRejection = (event: any) => {
      // console.log("Global unhandledrejection handler:", event);
      if (
        event.reason.message === "Network Error" ||
        (event.reason && event.reason.message === "Network Error")
      ) {
        tracking.trackNetworkError(
          `errorCode=${event.error};version=${clientVersion + "," + webVersion}`
        );
        eventBus.emit("showModal", { show: true, type: "netorkError" });
        event.preventDefault(); // 阻止默认处理
      }
    };

    // 防止鼠标宏键触发导致路由发送更改
    const handleMouseButtons = (event: any) => {
      // 如果按下的是某个特定的鼠标按钮（例如第四个按钮），则执行导航操作
      if (event.button > 2) {
        navigate(location.pathname); // 导航到当前页面
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("mousedown", handleMouseButtons);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("mousedown", handleMouseButtons);
    };
  }, [navigate, location.pathname]);

  // 检查当前文档是否已经加载完毕
  useEffect(() => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      localStorage.removeItem("isAccelLoading");
      // 如果 DOM 已经加载完毕，直接执行
      setTimeout(async () => {
        const state: any = await iniliteAppFun();
        
        if (state?.state) {
          tracking.trackaBackgroundActivity();
          (window as any).NativeApi_RenderComplete();
        }
      }, 1000);
    } else {
      // 否则监听 DOMContentLoaded 事件
      document.addEventListener(
        "DOMContentLoaded",
        (window as any).NativeApi_RenderComplete()
      );

      // 清理函数
      return () => {
        document.removeEventListener(
          "DOMContentLoaded",
          (window as any).NativeApi_RenderComplete()
        );
        webSocketService.close({
          code: 4000,
          reason: "关闭主程序主动关闭 webSocket",
        });
      };
    }
  }, []);

  return (
    <Layout className="app-module">
      <Header
        className="app-header"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <LayoutHeader {...{ couponRefreshNum }} />
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
      {/* 弹窗放置 */}
      <RenderSrea />
    </Layout>
  );
};

export default Layouts;