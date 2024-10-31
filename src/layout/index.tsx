import React, { useEffect, useState, useRef } from "react";
import { Layout } from "antd";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { store } from "@/redux/store";
import { setAccountInfo } from "@/redux/actions/account-info";
import { updateBindPhoneState, openRealNameModal } from "@/redux/actions/auth";
import { setFirstAuth } from "@/redux/actions/firstAuth";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { setupInterceptors } from "@/api/api";
import { compareVersions } from "./utils";

import "./index.scss";
import routes from "@/routes";
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
  const versionNowRef = useRef(); // 客户端版本绑定

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  const historyContext: any = useHistoryContext(); // 自定义传递上下文 hook

  const { removeGameList, identifyAccelerationData } = useGamesInitialize();
  const { fetchBanner } = useFetchBanner(); // 请求banner图 hook

  const [couponRefreshNum, setCouponRefreshNum] = useState(0); // 是否刷新优惠券过期判断

  const handleMouseDown = () => {
    (window as any).NativeApi_OnDragZoneMouseDown();
  };

  const handleMouseUp = () => {
    (window as any).NativeApi_OnDragZoneMouseUp();
  };

  // 判断是否续费提醒
  const remindWhetherRenew = () => {
    const renewTime = Number(localStorage.getItem("renewalTime")) || 0; // 到期时间
    const time = new Date().getTime() / 1000; // 当前时间
    const user = accountInfo?.userInfo;

    if (
      accountInfo?.isLogin &&
      user?.is_vip &&
      time - renewTime > 86400 &&
      user?.vip_expiration_time - time <= 432000
    ) {
    }
  };

  // 读取客户端版本方法
  const nativeVersion = () => {
    (window as any).NativeApi_AsynchronousRequest(
      "QueryCurrentVersion",
      "",
      (response: string) => {
        const parsedResponse = JSON.parse(response);
        versionNowRef.current = parsedResponse?.version;
      }
    );
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
        // 升级版本比较
        if (!isClosed && version) {
          // 升级弹窗要在登录之后才会弹出
          let isTrue = compareVersions(
            versionNowRef.current,
            version?.min_version
          );
          if (isTrue) {
            // stopProxy();
            eventBus.emit("showModal", {
              show: true,
              type: "newVersionFound",
              version: version?.now_version,
            });
            return;
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
            if (isNewUser && !isModalDisplayed) {
              // 判断是否为新用户且弹窗尚未展示过，并且 data.user_info 是一个非空对象
              setTimeout(() => {
                // setModalVisible(true); // 新用户弹出
              }, 500);
            }

            if (isModalDisplayed) {
              // payNewActive(renewal, purchase);
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
            const data = identifyAccelerationData();
            const isTrue = data?.[0];
            const isFree =
              data?.[1]?.free_time && data?.[1]?.tags.includes("限时免费");

            // 3个参数 用户信息 是否登录 是否显示登录
            dispatch(setAccountInfo(user_info, true, false));

            // 加速中并且会员到期 停止加速
            if (isTrue && !isFree && !user_info?.is_vip) {
              // stopProxy();
              eventBus.emit("showModal", {
                show: true,
                type: "accelMemEnd",
              });
            }

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
                // setThirdBindType("bind"); // 定义成功类型
                tracking.trackLoginSuccess("0");
                // setBindOpen(true); // 触发成功弹窗
              } else if ([2, 3].includes(Number(bind_type))) {
                // setThirdBindType(type_obj?.[String(bind_type)]); // 定义成功类型
                tracking.trackLoginSuccess("0");
                // setBindOpen(true); // 触发成功弹窗
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
              dispatch(updateBindPhoneState(true));
              eventBus.emit("clearTimer");
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
    // stopProxy(); // 初始化调用停止加速
    const intervalId = setInterval(() => {
      fetchBanner(); // 获取 banner 图逻辑
    }, 3 * 60 * 60 * 1000);

    remindWhetherRenew(); // 判断是否续费提醒
    nativeVersion(); // 读取客户端版本
    navigate("/home");

    // 清理函数，在组件卸载前清除定时器
    return () => {
      clearInterval(intervalId);
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
    const handleGlobalError = (event: any) => {
      console.error("Global error handler:", event);
      if (
        event.message === "Network Error" ||
        (event.error && event.error.message === "Network Error")
      ) {
        tracking.trackNetworkError(event.error.message);
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

  useEffect(() => {
    // 检查当前文档是否已经加载完毕
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