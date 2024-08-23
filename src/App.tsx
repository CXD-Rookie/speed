import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { connect, useDispatch, useSelector } from "react-redux";
import { menuActive } from "./redux/actions/menu";
import { setAccountInfo } from "./redux/actions/account-info";
import { setVersion } from "@/redux/actions/version";
import { setFirstAuth } from "@/redux/actions/firstAuth";
import { updateBindPhoneState, openRealNameModal } from "@/redux/actions/auth";
import { useGamesInitialize } from "./hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setupInterceptors } from "./api/api";
import { store } from "@/redux/store";

import activePayApi from "@/api/activePay";
import tracking from "@/common/tracking";
import "@/assets/css/App.scss";
import AppCloseModal from "./containers/app-close";
import PayModal from "./containers/Pay";
import eventBus from "./api/eventBus";
import webSocketService from "./common/webSocketService";
import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import PayModalNew from "@/containers/Pay/new";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import SettingsModal from "./containers/setting/index";
import IssueModal from "./containers/IssueModal/index";
import BreakConfirmModal from "@/containers/break-confirm";
import VisitorLogin from "./containers/visitor-login";
import MinorModal from "./containers/minor";
import Active from '@/containers/active/index'
import ActiveNew from '@/containers/active/newOpen';
import loginApi from "./api/login";
import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import closeIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.png";

const { Header, Content } = Layout;

interface CustomMenuProps {
  key: string;
  label: string;
  router: string;
  routerList?: Array<string>;
  is_active?: boolean;
}

// global.d.ts
interface Window {
  NativeApi_ExitProcess: () => void; //退出程序
  NativeApi_OnDragZoneMouseDown: () => void; //鼠标点击事件,放在拖拽区域里面
  NativeApi_OnDragZoneMouseUp: () => void; //鼠标松开事件,放在拖拽区域里面
  NativeApi_MinimumWindow: () => void; //最小化
  cefQuery: () => void; //不用管
}

const mapStateToProps = (state: any) => ({
  // Map state to props if needed
  state,
});

const mapDispatchToProps = (dispatch: any) => ({
  setMenuActive: (payload: any) => dispatch(menuActive(payload)),
});

const App: React.FC = (props: any) => {
  const { state, setMenuActive } = props;

  const dispatch: any = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const historyContext: any = useHistoryContext();
  const isBindPhone = useSelector((state: any) => state.auth.isBindPhone);
  const { removeGameList, identifyAccelerationData } = useGamesInitialize();

  const routeView = useRoutes(routes); // 获得路由表

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const [isModalVisible, setModalVisible] = useState(false);//是否展示新用户获取vip成功通知
  const [isModalVisibleNew, setIsModalVisibleNew] = useState(false);//是否展示新用户获取vip成功通知
  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip
  const [renewalOpen, setRenewalOpen] = useState(false); // 续费提醒
  const [remoteLoginOpen, setRemoteLoginOpen] = useState(false); // 异地登录
  const [showSettingsModal, setShowSettingsModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

  const [exitOpen, setExitOpen] = useState(false); // 是否关闭主程序
  const [accelOpen, setAccelOpen] = useState(false); // 是否确认退出登录
  const [isAppCloseOpen, setIsAppCloseOpen] = useState(false); // 是否手动设置关闭主程序操作
  const [thirdBindType, setThirdBindType] = useState(""); // 第三方绑定成功之后返回状态 绑定还是换绑
  const [bindOpen, setBindOpen] = useState(false); // 第三方绑定状态窗
  const [reopenLogin, setReopenLogin] = useState(false); // 第三方绑定状态窗
  const [versionNow, setVersionNow] = useState(""); // 当前版本
  const isNewUser = localStorage.getItem("is_new_user") === "true"; //是否是新用户
  const versionNowRef = useRef(versionNow);
  const [modalType, setModalType] = useState<number | null>(null);// 新用户的支付弹窗类型2是充值，3是续费
  const [isModalOpenNew, setIsModalOpenNew] = useState(false); // 新用户的支付弹窗
  const menuList: CustomMenuProps[] = [
    {
      key: "home",
      label: "首页",
      router: "/home",
      routerList: ["/home", "/myGames", "/gameDetail"],
    },
    {
      key: "gameLibrary",
      label: "游戏库",
      router: "/gameLibrary",
      routerList: ["/gameLibrary"],
    },
  ];

  const loginOutStopWidow = async () => {
    //登录过期和异地登录使用的
    setRemoteLoginOpen(true);
  };
  (window as any).loginOutStopWidow = loginOutStopWidow;

  const loginOutStop = async (t: any = null) => {
    const jsonString = JSON.stringify({
      params: {
        user_token: localStorage.getItem("token"),
        js_key: localStorage.getItem("StartKey"),
      },
    });

    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_StopProxy",
      jsonString || "",
      function (response: any) {
        console.log("Success response from 停止加速:", response);
        tracking.trackBoostDisconnectManual("手动停止加速");
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        removeGameList("initialize"); // 更新我的游戏
        loginOut(t);
      }
    );
  };

  const speedError = async (t: any = null) => {
    //客户端使用，业务不处理，用于判断加速异常的提示使用
    const jsonString = JSON.stringify({
      params: {
        user_token: localStorage.getItem("token"),
        js_key: localStorage.getItem("StartKey"),
      },
    });

    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_StopProxy",
      jsonString || "",
      function (response: any) {
        tracking.trackBoostDisconnectPassive(0);
        console.log(response, "------------加速异常-----------");
      }
    );
  };
  (window as any).speedError = speedError;

  // // 挂载到 window 对象上
  // (window as any).loginOutStop = loginOutStop;
  const loginOut = async (type: any = null) => {
    let res = await loginApi.loginOut();

    if (res.error === 0) { 
      localStorage.removeItem("token");
      localStorage.removeItem("isRealName");
      // localStorage.removeItem("is_new_user");
      eventBus.emit('clearTimer');
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo({}, false, false));
      navigate("/home");
      if (type === 1) {
        setReopenLogin(true);
      }
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          className="public-style"
          onClick={() => setShowSettingsModal(true)}
        >
          设置
        </div>
      ),
    },
    // 只有当 token 存在时才显示 "问题反馈" 这一项
    ...(accountInfo?.isLogin
      ? ([
          {
            key: "2",
            label: (
              <div
                className="public-style"
                onClick={() => setShowIssueModal(true)}
              >
                问题反馈
              </div>
            ),
          },
          {
            type: "divider",
          },
          {
            key: "3",
            label: (
              <div className="public-style" onClick={() => setAccelOpen(true)}>
                退出登录
              </div>
            ),
          },
        ] as any)
      : []),
  ];

  // 点击菜单
  const handleChangeTabs = (item: any) => {
    let localtion = item?.router || "home";

    setMenuActive(item?.key);
    navigate(localtion, {
      replace: false,
      state: {
        id: item,
      },
    });
  };

  // 定义退出程序的处理函数
  const handleExitProcess = () => {
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
      async function (response: any) {
        console.log(response, "----------------------------------");
        tracking.trackBoostDisconnectManual("手动停止加速");
        let list = (await removeGameList("initialize")) || []; // 更新我的游戏
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        if (list?.length >= 0) {
          (window as any).NativeApi_ExitProcess();
        }
      }
    );
  };

  const handleMinimize = async () => {
    (window as any).NativeApi_MinimumWindow();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    (window as any).NativeApi_OnDragZoneMouseDown();
    console.log("--111111111111111111111");
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    (window as any).NativeApi_OnDragZoneMouseUp();
    console.log("--wwwwwwwwwwwww");
  };

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("--eeeeeeeee");
    e.stopPropagation();
  };

  useEffect(() => {
    setMenuActive(location?.pathname);
  }, [location]);

  useEffect(() => {
    setupInterceptors({
      historyContext,
      removeGameList,
    });
  }, [historyContext, removeGameList]);

  useEffect(() => {
    const handleNavigateToHome = () => {
      navigate("/home");
    };

    eventBus.on("navigateToHome", handleNavigateToHome);

    return () => {
      eventBus.off("navigateToHome", handleNavigateToHome);
    };
  }, [navigate]);

  function compareVersions(version1: string = "", version2: string = "") {
    // 将版本号按点号分割成数组
    const parts1 = version1.split(".").map(Number);
    const parts2 = version2.split(".").map(Number);

    // 获取最长的版本号长度
    const maxLength = Math.max(parts1.length, parts2.length);

    // 循环比较每个部分
    for (let i = 0; i < maxLength; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) {
        return false; // 如果前者大于后者版本，返回 false
      } else if (num1 < num2) {
        return true; // 如果前者小于后者版本，返回 true
      }
    }

    // 如果版本号完全相等，返回 false
    return false;
  }

  // 停止加速
  const stopProxy = () => {
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
        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }
        
        historyContext?.accelerateTime?.stopTimer();
        removeGameList("initialize"); // 更新我的游戏
        navigate("/home");
      }
    );
  };

  const stopSpeed = () => {
    //全局只给客户端调用，业务不处理,是到托盘之后邮件 弹出的关闭按钮的方法
    //0 最小化托盘 1 关闭主程序 2 或没值弹窗提示框
    if (identifyAccelerationData()?.[0]) {
      (window as any).NativeApi_ShowWindow(); // 唤醒主程序客户端方法
      setExitOpen(true); // 弹出关闭确认框
    } else {
      (window as any).NativeApi_ExitProcess();
    }
  };
  (window as any).stopSpeed = stopSpeed;

  const closeTypeNew = () => {
    let close = localStorage.getItem("client_settings");
    let action = close ? JSON.parse(close)?.close_button_action : 2;

    //0 最小化托盘 1 关闭主程序 2 或没值弹窗提示框
    if (action === 0) {
      (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
    } else if (action === 1 && identifyAccelerationData()?.[0]) {
      setExitOpen(true); // 弹出关闭确认框
    } else {
      setIsAppCloseOpen(true); // 弹出设置选择框
    }
  };

  (window as any).closeTypeNew = closeTypeNew;

  const showSettingsForm = () => {
    //给客户端用的设置弹展示方法
    setShowSettingsModal(true);
  };
  (window as any).showSettingsForm = showSettingsForm;

  const native_version = () => {
    console.log("首页获取版本做对比");
    (window as any).NativeApi_AsynchronousRequest(
      "QueryCurrentVersion",
      "",
      (response: string) => {
        const parsedResponse = JSON.parse(response);
        setVersionNow(parsedResponse.version);
        versionNowRef.current = parsedResponse.version;
      }
    );
  };

  // 是否关闭新用户三天会员
  const handleCloseModal = () => {
    // 标记弹窗已展示
    localStorage.setItem('isModalDisplayed', 'true');
    setModalVisible(false);
  };

  const handleCloseModalNew = () => { 
    setIsModalVisibleNew(false);
    setTimeout(() => {
      dispatch(setAccountInfo(undefined, undefined, true))
      localStorage.setItem("isActiveNew", "1");
    }, 500);
  }

  useEffect(() => {
    native_version();
    console.log(versionNow, "客户端获取的版本----------------");
  }, [versionNow]);

  useEffect(() => {
    // 从 localStorage 获取 client_settings
    let clientSettings = localStorage.getItem("client_settings");

    try {
      // 尝试解析 client_settings
      let settingsObject = clientSettings ? JSON.parse(clientSettings) : {};

      // 设置 close_button_action 的值，如果不存在则添加
      if (
        settingsObject.close_button_action === null ||
        settingsObject.close_button_action === "" ||
        settingsObject.close_button_action === undefined
      ) {
        settingsObject.close_button_action = 0; // 1 表示关闭程序，0 表示隐藏到托盘
      }

      // 更新或者设置 client_settings
      localStorage.setItem("client_settings", JSON.stringify(settingsObject));

      console.log(
        "client_settings updated:",
        localStorage.getItem("client_settings")
      );
    } catch (error) {
      console.error("Error parsing client_settings:", error);
    }
  }, []);

  const avtiveDay = async () => {
    const images = JSON.parse(localStorage.getItem("all_data") || "[]");
    const lastPopupTime:any = localStorage.getItem('lastPopupTime');
  
    // 当前时间
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // 当天的23:59:59
  
    if (!lastPopupTime && images?.length > 0) {
      // 如果从未展示过弹窗，则直接展示
      setTimeout(() => {
        setIsModalVisibleNew(true); // 新用户弹出
        // 标记弹窗已展示，记录当前时间
        localStorage.setItem('lastPopupTime', now.toISOString());
      }, 2000);
    } else {
      const lastPopupDate = new Date(lastPopupTime);

      // 如果上次弹窗展示时间早于当天的23:59:59，则再次展示
      if (lastPopupDate < endOfDay && now >= endOfDay) {
        setTimeout(() => {
          setIsModalVisibleNew(true); // 新用户弹出
          // 更新弹窗展示时间，记录新的时间
          localStorage.setItem('lastPopupTime', now.toISOString());
        }, 2000);
      }
    }
  }

  const fetchData = async () => {
    try {
        const response = await activePayApi.getBanner();
        const data = response.data || {};
        const firstPurchase = data.first_purchase; // 首次充值
        const firstRenewal = data.first_renewal; // 首次续费
        const newUser = data.new_user; // 新用户
        const isPayActive = localStorage.getItem('isPayActive') === 'true';//控制24小时充值弹窗的展示
        // 创建一个空数组来存储所有的 banner 数据
        let all_data: any[] = [];  
        // let all_data: any[] = JSON.parse(localStorage.getItem("all_data") || "[]");      
        // 如果 new_user 有数据，则更新 localStorage 并插入到 all_data
        if (newUser && newUser.length > 0) {
            localStorage.setItem("new_user", JSON.stringify(newUser));
            all_data = [...all_data, ...newUser];
        } else {
            localStorage.removeItem("new_user");
        }

        // 如果 first_purchase 有数据，则更新 localStorage 并插入到 all_data
        if (firstPurchase && firstPurchase.length > 0) {
            localStorage.setItem("first_purchase", JSON.stringify(firstPurchase));
            all_data = [...all_data, ...firstPurchase];
        } else {
            localStorage.removeItem("first_purchase");
        }

        // 如果 first_renewal 有数据，则更新 localStorage 并插入到 all_data
        if (firstRenewal && firstRenewal.length > 0) {
            localStorage.setItem("first_renewal", JSON.stringify(firstRenewal));
            all_data = [...all_data, ...firstRenewal];
        } else {
            localStorage.removeItem("first_renewal");
        }

        // 将最终的 all_data 存入 localStorage，允许为空数组
        // localStorage.setItem("all_data", JSON.stringify(all_data)); // swiper banner数据
        if (all_data.length > 0) {
          localStorage.setItem("all_data", JSON.stringify(all_data));
          if(all_data?.length > 0 && !isPayActive){
            avtiveDay()
            localStorage.setItem("isPayActive",'true')
          }
        } else {
            console.log("No new data to update. Keeping existing all_data.");
        }
    } catch (error) {
        console.error("Failed to fetch banner data:", error);
    }
  };

  
  //控制24小时展示一次的活动充值页面
  // 控制活动充值页面在当天23:59:59后再次展示
  const payNewActive = async (first_renewed: any, first_purchase: any) => {
    const lastPopupTime1:any = localStorage.getItem('lastPopupTime1');
    const isNewUser = localStorage.getItem('is_new_user') === 'true';
    const now = new Date();
    
    // 获取当前时间
    const currentDayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // 判断是否为新用户且弹窗需要展示
    if (!lastPopupTime1 && !isNewUser) {
      // 如果从未展示过弹窗，则直接展示
      setTimeout(() => {
        // 标记弹窗已展示
        if (!first_renewed && first_purchase) {
          setModalType(Number(2));
          setIsModalOpenNew(true);
        } else if(!first_purchase && first_renewed) {
          setModalType(Number(3));
          setIsModalOpenNew(true);
        }
        localStorage.setItem('lastPopupTime1', currentDayEnd.toISOString());
      }, 2000);
    } else {
      const lastPopupDate = new Date(lastPopupTime1);
      
      // 如果上次展示时间不是当天23:59:59，并且当前时间已经过了这个时间点，则展示弹窗
      if (now >= lastPopupDate) {
        setTimeout(() => {
          // 更新弹窗展示时间到今天的23:59:59
          if (!first_renewed && first_purchase) {
            setModalType(Number(2));
            setIsModalOpenNew(true);
          } else if(!first_purchase && first_renewed) {
            setModalType(Number(3));
            setIsModalOpenNew(true);
          }
          localStorage.setItem('lastPopupTime1', currentDayEnd.toISOString());
        }, 2000);
      }
    }
  };

  useEffect(() => {
    fetchData();
  
    const intervalId = setInterval(fetchData, 3 * 60 * 60 * 1000);
  
    const clearTimer = () => {
      clearInterval(intervalId);
    };
  
    eventBus.on('clearTimer', clearTimer);
  
    return () => {
      clearInterval(intervalId);
      eventBus.off('clearTimer', clearTimer);
    };
  }, []);

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const token = localStorage.getItem("token");
      const isClosed = localStorage.getItem("isClosed");
      const allData = JSON.parse(localStorage.getItem("all_data") || "[]");
      const firstPurchase = JSON.parse(localStorage.getItem("first_purchase") || "[]"); // 首次充值
      const firstRenewal = JSON.parse(localStorage.getItem("first_renewal") || "[]"); // 首次续费
      const newUser = JSON.parse(localStorage.getItem("new_user") || "[]"); //首次登录的活动
      // 获取localStorage中是否展示过标志
      const isModalDisplayed = localStorage.getItem('isModalDisplayed') === 'true';
      const isNewUser = localStorage.getItem('is_new_user') === 'true';
      // const vipExperienceTime = localStorage.getItem('vip_experience_time');
      const images = JSON.parse(localStorage.getItem("all_data") || "[]");
      // console.log(versionNowRef.current, "客户端获取的版本---------------");
      // console.log(data, "ws返回的信息---------------");

      const version = data?.data?.version;
      dispatch(setVersion(version));

      if (!Array.isArray(firstPurchase)) {
        console.error("Invalid data for firstPurchase:", firstPurchase);
      }

      if (!Array.isArray(firstRenewal)) {
        console.error("Invalid data for firstRenewal:", firstRenewal);
      }

      if (!Array.isArray(newUser)) {
        console.error("Invalid data for newUser:", newUser);
      }

      if(token && (data.code === 0 || data.code === "0")){
        let filteredData = allData;
        const firstAuth = data?.data?.first_purchase_renewed;
        const first_purchase = firstAuth?.first_purchase;
        const first_renewed = firstAuth?.first_renewed;

        dispatch(setFirstAuth(firstAuth));
        // 过滤掉 newUser 的数据
        filteredData = allData.filter((item: any) => {
          return !newUser.some((newItem: any) => newItem.image_url === item.image_url);
        });

        // 根据 first_purchase 和 first_renewal 的状态进行筛选
        if (first_purchase && !first_renewed) {
          // 保持 all_data 中只有 first_purchase 的数据
          filteredData = firstPurchase;
        } else if (!first_purchase && first_renewed) {
          // 保持 all_data 中只有 first_renewal 的数据
          filteredData = firstRenewal;
        } else if (!first_purchase && !first_renewed) {
          // 如果两者都是 false，清空 filteredData
          filteredData = [];
        }
        
        if (images?.length > 0 && store?.getState()?.accountInfo?.isLogin) {
          if (isNewUser && !isModalDisplayed) {
            // 判断是否为新用户且弹窗尚未展示过，并且 data.user_info 是一个非空对象
            setTimeout(() => {
              setModalVisible(true); // 新用户弹出
            }, 500);
          }

          if (isModalDisplayed) {
            payNewActive(first_renewed, first_purchase);
          }
        }

        // 更新 localStorage 中的 all_data
        localStorage.setItem("all_data", JSON.stringify(filteredData));

        // 通过 eventBus 通知更新
        eventBus.emit('dataUpdated', filteredData);
      }

      if (token && (isClosed === null || isClosed === undefined || isClosed === "") && (version != null || version != undefined || version != "")) {
        //升级弹窗要在登录之后才会弹出
        let isTrue = compareVersions(
          versionNowRef.current,
          version?.min_version
        );
        if (isTrue) {
          stopProxy();
          eventBus.emit("showModal", {
            show: true,
            type: "newVersionFound",
            version: version?.now_version,
          });
          return;
        }
      }
    
      if (data.code === 0 || data.code === "0") {
        localStorage.removeItem("isClosed");
        let userInfo = data?.data?.user_info || {};
        if (
          (userInfo?.user_ext?.name === "" && userInfo?.user_ext?.idcard === "")
        ) {
          localStorage.setItem("isRealName", "1");
        } else {
          localStorage.setItem("isRealName", "0");
        }

        if (!!userInfo?.phone) {
          // 3个参数 用户信息 是否登录 是否显示登录
          dispatch(setAccountInfo(userInfo, true, false));
          const data = identifyAccelerationData();

          let isTrue = data?.[0];
          let isFree =
            data?.[1]?.free_time && data?.[1]?.tags.includes("限时免费");

          // 加速中并且会员到期 停止加速
          if (isTrue && !isFree && !userInfo?.is_vip) {
            stopProxy();
            eventBus.emit("showModal", {
              show: true,
              type: "accelMemEnd",
            });
          }

          let bind_type = JSON.parse(localStorage.getItem("thirdBind") || "-1");
          let type_obj: any = {
            "2": "thirdBind",
            "3": "thirdUpdateBind",
          };
          
          if (bind_type >= 0) {
            dispatch(setAccountInfo(userInfo, true, false));
            if (isNewUser) {
              setThirdBindType("bind"); // 定义成功类型
              tracking.trackLoginSuccess("0");
              setBindOpen(true); // 触发成功弹窗
            } else if ([2, 3].includes(Number(bind_type))) {
              setThirdBindType(type_obj?.[String(bind_type)]); // 定义成功类型
              tracking.trackLoginSuccess("0");
              setBindOpen(true); // 触发成功弹窗
            }
            
            localStorage.removeItem("thirdBind"); // 删除第三方绑定的这个存储操作
            webSocketService.loginReconnect();
          }
        } else {
          let bind_type = JSON.parse(localStorage.getItem("thirdBind") || "-1");
          
          if (!store.getState().auth?.isBindPhone && bind_type >= 0) {
            localStorage.removeItem("thirdBind");
            dispatch(updateBindPhoneState(true));
            eventBus.emit("clearTimer");
          } else {
            //24小时充值活动
            // if (images?.length > 0) {
            //   if (isNewUser && !isModalDisplayed) {
            //     // 判断是否为新用户且弹窗尚未展示过，并且 data.user_info 是一个非空对象
            //     setTimeout(() => {
            //       setModalVisible(true); // 新用户弹出
            //     }, 500);
            //   }
            //   if (isModalDisplayed) {
            //     payNewActive(first_renewed, first_purchase);
            //   }
            // }
          }
        }
      }
    };

    const url = `${process.env.REACT_APP_WSAPI_URL}`;
    webSocketService.connect(url, handleWebSocketMessage, dispatch);
    return () => {
      webSocketService.close();
    };
  }, []);

  useEffect(() => {
    let renewalTime = Number(localStorage.getItem("renewalTime")) || 0;
    let time = new Date().getTime() / 1000;
    let info = accountInfo?.userInfo;

    if (
      time - renewalTime > 86400 &&
      accountInfo?.isLogin &&
      info?.is_vip &&
      info?.vip_expiration_time - time <= 432000
    ) {
      localStorage.setItem("renewalTime", String(time));
      setRenewalOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleGlobalError = (event: any) => {
      console.error("Global error handler:", event);
      if (
        event.message === "Network Error" ||
        (event.error && event.error.message === "Network Error")
      ) {
        tracking.trackNetworkError(event.error.message);
        console.log("进入全局异常捕获了")
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
        tracking.trackNetworkError(event.error.message);
        console.log("进入全局异常捕获了2")
        eventBus.emit("showModal", { show: true, type: "netorkError" });
        event.preventDefault(); // 阻止默认处理
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    const handleMouseButtons = (event: any) => {
      // 在这里添加你的逻辑来处理鼠标按钮事件
      // console.log("鼠标按钮事件：", event.button);
      // 如果按下的是某个特定的鼠标按钮（例如第四个按钮），则执行导航操作
      if (event.button > 2) {
        // 假设按下的是第四个按钮
        navigate(location.pathname); // 导航到当前页面
      }
    };

    window.addEventListener("mousedown", handleMouseButtons);

    return () => {
      window.removeEventListener("mousedown", handleMouseButtons);
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    stopProxy()
  }, []);


  return (
    <Layout className="app-module">
      <Header
        className="app-header"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <img
          className="header-icon"
          src={logoIcon}
          width={40}
          height={40}
          alt=""
        />
        <div className="header-functional-areas">
          <div
            className="menu-list"
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
          >
            {menuList.map((item) => (
              <div
                key={item?.key}
                className={`menu ${
                  // state?.menu === item?.router && "menu-active"
                  item?.routerList?.includes(state?.menu) && "menu-active"
                }`}
                onClick={() => handleChangeTabs(item)}
              >
                {item?.label}
              </div>
            ))}
          </div>
          <div onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
            <SearchBar />
          </div>

          <div
            className="personal-information"
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
          >
            {accountInfo?.isLogin ? (
              <CustomDropdown />
            ) : (
              <div
                className="login-enroll-text"
                onClick={() =>
                  dispatch(setAccountInfo(undefined, undefined, true))
                }
              >
                登录/注册
              </div>
            )}
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <img className="minType" src={menuIcon} alt="" />
            </Dropdown>
            <img
              onClick={handleMinimize}
              className="minType"
              src={minIcon}
              alt=""
            />
            <img
              onClick={() => {
                let close = localStorage.getItem("client_settings");
                let action = close ? JSON.parse(close)?.close_button_action : 2;
                let noMorePrompts = localStorage.getItem("noMorePrompts");

                // 0 最小化托盘 1 关闭主程序 2 或没值弹窗提示框
                // 如果当前游戏是加速中并且是关闭主程序
                if (
                  action === 1 &&
                  identifyAccelerationData()?.[0] &&
                  String(noMorePrompts) === "true"
                ) {
                  setExitOpen(true); //确定要退出加速器弹窗
                } else {
                  // 提示存在
                  if (!(String(noMorePrompts) === "true")) {
                    setIsAppCloseOpen(true);
                  } else {
                    if (action === 0) {
                      (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
                    } else if (action === 1) {
                      (window as any).NativeApi_ExitProcess(); //关闭主程序
                    }
                  }
                }
              }}
              className="closeType"
              src={closeIcon}
              alt=""
            />
          </div>
        </div>
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>

      {(accountInfo?.isShowLogin || reopenLogin) && (
        <div
          className="login-mask"
          style={{
            display: accountInfo?.isShowLogin || reopenLogin ? "block" : "none",
          }}
        >
          <Login />
        </div>
      )}
      {showSettingsModal ? (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      ) : null}
      {showIssueModal ? (
        <IssueModal
          showIssueModal={showIssueModal}
          onClose={() => setShowIssueModal(false)}
        />
      ) : null}
      {/* 确认退出弹窗 */}
      <BreakConfirmModal
        accelOpen={accelOpen}
        type={"loginOut"}
        setAccelOpen={setAccelOpen}
        onConfirm={() => {
          setAccelOpen(false);
          loginOutStop();
        }}
      />
      <VisitorLogin loginOutStop={loginOutStop} />
      {/* 关闭主程序 */}
      {exitOpen ? (
        <BreakConfirmModal
          type={"exit"}
          accelOpen={exitOpen}
          setAccelOpen={setExitOpen}
          onConfirm={handleExitProcess}
        />
      ) : null}
      {/* vip 充值弹窗 */}
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {/* 续费提醒确认弹窗 */}
      {renewalOpen ? (
        <BreakConfirmModal
          accelOpen={renewalOpen}
          type={"renewalReminder"}
          setAccelOpen={setRenewalOpen}
          onConfirm={() => {
            setRenewalOpen(false);
            const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息

            if (isRealNamel === "1") {
              dispatch(openRealNameModal());
              return;
            }
            
            setIsModalOpenVip(true);
          }}
        />
      ) : null}
      {/* 异地登录提醒弹窗 */}
      {remoteLoginOpen ? (
        <MinorModal
          isMinorOpen={remoteLoginOpen}
          type={"remoteLogin"}
          setIsMinorOpen={() => {
            setRemoteLoginOpen(false);
            loginOutStop(1);
          }}
        />
      ) : null}
      {/* 提示修改关闭窗口设置 */}
      {isAppCloseOpen ? (
        <AppCloseModal
          open={isAppCloseOpen}
          close={setIsAppCloseOpen}
          onConfirm={(state) => {
            console.log(state, "------------");
            let is_acc = identifyAccelerationData()?.[0];

            if (state === 0) {
              (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
            } else {
              if (is_acc) {
                setExitOpen(is_acc); // 有加速的游戏，二次确认
              } else {
                handleExitProcess(); // 直接关闭
              }
            }
          }}
        />
      ) : null}
      {bindOpen ? (
        <MinorModal
          type={thirdBindType}
          isMinorOpen={bindOpen}
          setIsMinorOpen={setBindOpen}
        />
      ) : null}
      <Active isVisible={isModalVisible} onClose={handleCloseModal} />
      <ActiveNew
        isVisible={isModalVisibleNew}
        onClose={handleCloseModalNew}
      />
      {!!isModalOpenNew && (
        <PayModalNew
          isModalOpen={isModalOpenNew}
          setIsModalOpen={(e) => setIsModalOpenNew(e)}
          type={modalType}
        />
      )}
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
