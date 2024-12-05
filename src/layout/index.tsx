import React, { useEffect, useState, useRef } from "react";
import { Layout } from "antd";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { setAccountInfo } from "@/redux/actions/account-info";
import {
  setDrawVipActive,
  setFirstPayRP,
  setMinorState,
  setAppCloseOpen,
  setSetting,
  setVersionState,
  setLocalGameState,
} from "@/redux/actions/modal-open";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { setFirstAuth } from "@/redux/actions/firstAuth";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { setupInterceptors } from "@/api/api";
import {
  compareVersions,
  stopProxy,
  serverClientReport,
  exceptionReport,
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
    (window as any).NativeApi_AsynchronousRequest(
      "QueryCurrentVersion",
      "",
      (response: string) => {
        const parsedResponse = JSON.parse(response);
        versionNowRef.current = parsedResponse?.version;
        (window as any).versionNowRef = parsedResponse?.version; // 将版本挂载到window，强制升级处使用
      }
    );
  };

  // 初始设置
  const initialSetup = () => {
    try {
      let clientSetup = localStorage.getItem("client_settings");
      let setup = clientSetup ? JSON.parse(clientSetup) : {}; // 尝试解析 client_settings

      // 设置 close_button_action 的值，如果不存在则添加
      if (!setup?.close_button_action) {
        setup.close_button_action = 0; // 1 表示关闭程序，0 表示隐藏到托盘
      }

      // 更新或者设置 client_settings
      localStorage.setItem("client_settings", JSON.stringify(setup));
    } catch (error) {
      console.log("初始化设置", error);
    }
  };

  // 进程黑名单
  const initialProcessBlack = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const res = await playSuitApi.playProcessblacklist();
        const data = (res?.data || []).flatMap((item: any) => item.process);

        localStorage.setItem("processBlack", JSON.stringify(data));
      }
    } catch (error) {
      console.log("进程黑名单", error);
    }
  };

  // 初始化更新游戏
  const iniliteRenewal = async () => {
    try {
      const [list, data]: any = await Promise.all([
        await stopProcessReset(), // 初始化调用停止加速
        await gameApi.gameList(), // 所有游戏 { page: 1, pagesize: 5000 }
      ]);
      // console.log(data?.data?.list);
      
      (window as any).NativeApi_AsynchronousRequest(
        "SetGameData",
        JSON.stringify({ list: data?.data?.list ?? [] }),
        () => {}
      );

      const meGame: any = list?.data ?? [];
      const allGame = data?.data?.list ?? [];
      const result = meGame.map((item: any) => {
        // 如果找到此游戏
        const target = allGame?.find((child: any) => child?.id === item?.id);
        
        // 如果找到此游戏并且更新时间发生改变
        if (target && target?.update_time !== item?.update_time) {
          return {
            ...item,
            ...target,
            cover_img: `https://cdn.accessorx.com/${
              target?.cover_img ?? target.background_img
            }`,
          };
        } else if (target) {
          return item;
        }
      })
      
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
      
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(filteredArray));
      navigate("/home");
      return filteredArray;
    } catch (error) {
      console.log("初始化更新游戏", error);
    }
  };

  // 定义停止加速应该做的操作
  // 可接收 value 做关闭，退出操作 exit
  const stopProcessReset = async (value: any = "") => {
    return new Promise(async (resolve, reject) => {
      try {
        if (localStorage.getItem("isAccelLoading") === "1") {
          return; // 如果退出时游戏还在加速中，则暂不处理，停止向下执行
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
      await stopProcessReset(); // 停止加速操作
      await loginApi.loginOut(); // 调用退出登录接口，不需要等待返回值

      if ((window as any).bannerTimer) {
        (window as any).bannerTimer(); //
      }

      localStorage.removeItem("token");
      localStorage.removeItem("isRealName"); // 去掉实名认证
      dispatch(setAccountInfo({}, false, false)); // 修改登录状态

      if (event === "remoteLogin") {
        dispatch(setMinorState({ open: true, type: "remoteLogin" })); // 异地登录
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

      console.log(
        "已经存在的本地扫描游戏: ",
        storeScanned,
        "新扫描到的游戏:",
        allowAdd,
        "当前游戏是否允许弹出:",
        isTootip
      );

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

  //控制24小时展示一次的活动充值页面
  // 控制活动充值页面在当天23:59:59后再次展示
  const payNewActive = async (first_renewed: any, first_purchase: any) => {
    const lastPopupTime1: any = localStorage.getItem("lastPopupTime1");
    const isNewUser = localStorage.getItem("is_new_user") === "true";
    const now = new Date();

    // 获取当前时间
    const currentDayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    // 判断是否为新用户且弹窗需要展示
    if (!lastPopupTime1 && !isNewUser) {
      // 如果从未展示过弹窗，则直接展示
      setTimeout(() => {
        // 标记弹窗已展示
        if (!first_renewed && first_purchase) {
          dispatch(setFirstPayRP({ open: true, type: 2 }));
        } else if (!first_purchase && first_renewed) {
          dispatch(setFirstPayRP({ open: true, type: 3 }));
        }
        localStorage.setItem("lastPopupTime1", currentDayEnd.toISOString());
      }, 2000);
    } else {
      const lastPopupDate = new Date(lastPopupTime1);

      // 如果上次展示时间不是当天23:59:59，并且当前时间已经过了这个时间点，则展示弹窗
      if (now >= lastPopupDate) {
        setTimeout(() => {
          // 更新弹窗展示时间到今天的23:59:59
          if (!first_renewed && first_purchase) {
            tracking.trackPurchaseFirstBuy();
            dispatch(setFirstPayRP({ open: true, type: 2 }));
          } else if (!first_purchase && first_renewed) {
            tracking.trackPurchaseFirstShow();
            dispatch(setFirstPayRP({ open: true, type: 3 }));
          }
          localStorage.setItem("lastPopupTime1", currentDayEnd.toISOString());
        }, 2000);
      }
    }
  };

  // webSocket 定时请求
  useEffect(() => {
    const handleWebSocket = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const token = localStorage.getItem("token");
      const isClosed = localStorage.getItem("isClosed");
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
                // dispatch(setNewUserOpen(true));
                dispatch(setDrawVipActive({ open: true }));
              }, 500);
            }

            if (isModalDisplayed) {
              payNewActive(renewal, purchase);
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

          if (!!user_info?.phone) {
            // 3个参数 用户信息 是否登录 是否显示登录
            dispatch(setAccountInfo(user_info, true, false));

            const bind_type = JSON.parse(
              localStorage.getItem("thirdBind") || "-1"
            );
            const type_obj: any = {
              "2": "thirdBind",
              "3": "thirdUpdateBind",
            };

            if (bind_type >= 0) {
              dispatch(setAccountInfo(user_info, true, false));

              if (isNewUser) {
                const time = localStorage.getItem("firstActiveTime");
                const currentTime = Math.floor(Date.now() / 1000); // 当前时间
                const isTrue = time && currentTime < Number(time);

                tracking.trackSignUpSuccess("youXia", isTrue ? 1 : 0);
              } else {
                tracking.trackLoginSuccess("youXia");
              }

              if (isNewUser) {
                dispatch(setMinorState({ open: true, type: "bind" })); // 三方绑定提示
              } else if ([2, 3].includes(Number(bind_type))) {
                dispatch(
                  setMinorState({
                    open: true,
                    type: type_obj?.[String(bind_type)],
                  })
                ); // 三方绑定提示
              }

              localStorage.removeItem("thirdBind"); // 删除第三方绑定的这个存储操作
              webSocketService.loginReconnect();
            }
          } else {
            let bind_type = JSON.parse(
              localStorage.getItem("thirdBind") || "-1"
            );

            // 第三方登录没有返回手机号的情况下，弹窗手机号绑定逻辑
            if (!store.getState().auth?.isBindPhone && bind_type >= 0) {
              localStorage.removeItem("thirdBind");

              if ((window as any).bannerTimer) {
                (window as any).bannerTimer();
              }

              dispatch(setAccountInfo(undefined, false, false));
              dispatch(updateBindPhoneState(true));
            }
          }
        }
      }
    };

    webSocketService.connect(
      `${process.env.REACT_APP_WSAPI_URL}`, // 请求环境
      handleWebSocket,
      dispatch
    );

    return () => {
      webSocketService.close();
    };
  }, []);

  // 初始化重置状态逻辑
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBanner(); // 获取 banner 图逻辑
    }, 3 * 60 * 60 * 1000);

    localStorage.removeItem("storeScanned"); // 关闭时清除扫描游戏存储

    iniliteRenewal(); // 初始化更新游戏;
    nativeVersion(); // 读取客户端版本
    initialSetup(); // 初始设置

    (window as any).bannerTimer = () => clearInterval(intervalId);

    // 清理函数，在组件卸载前清除定时器
    return () => {
      clearInterval(intervalId);

      if ((window as any).bannerTimer) {
        (window as any).bannerTimer();
      }
    };
  }, []);
  
  useEffect(() => {
    if (accountInfo.isLogin) {
      initialProcessBlack(); // 初始进程黑名单
    }
  }, [accountInfo.isLogin]);

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

    // 清理函数，在组件卸载时移除挂载
    return () => {
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

  // 用于给api.js传递 hook,在 10001时可以做清除 hook 调用处理
  useEffect(() => {
    setupInterceptors({
      historyContext,
      removeGameList,
    });
  }, [historyContext, removeGameList]);

  useEffect(() => {
    const webVersion = process.env.REACT_APP_VERSION;
    const clientVersion = (window as any).versionNowRef;

    const handleGlobalError = (event: any) => {
      console.error("Global error handler:", event);
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
      console.error("Global unhandledrejection handler:", event);
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
      setTimeout(() => {
        (window as any).NativeApi_RenderComplete();
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