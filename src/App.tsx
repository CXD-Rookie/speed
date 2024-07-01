import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { connect, useDispatch, useSelector } from "react-redux";
import { menuActive } from "./redux/actions/menu";
import { setAccountInfo } from "./redux/actions/account-info";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { useGamesInitialize } from "./hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setupInterceptors } from "./api/api";

import "@/assets/css/App.scss";
import AppCloseModal from "./containers/app-close";
import PayModal from "./containers/Pay";
import eventBus from "./api/eventBus";
import useCefQuery from "./hooks/useCefQuery";
import webSocketService from "./common/webSocketService";
import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import SettingsModal from "./containers/setting/index";
import IssueModal from "./containers/IssueModal/index";
import BreakConfirmModal from "@/containers/break-confirm";
import VisitorLogin from "./containers/visitor-login";

import loginApi from "./api/login";
import playSuitApi from "./api/speed";

import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import closeIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.svg";

const { Header, Content } = Layout;

interface CustomMenuProps {
  key: string;
  label: string;
  router: string;
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

  const sendMessageToBackend = useCefQuery();
  const historyContext: any = useHistoryContext();
  const isBindPhone = useSelector((state: any) => state.auth.isBindPhone);
  const { removeGameList, identifyAccelerationData } = useGamesInitialize();

  const routeView = useRoutes(routes); // 获得路由表

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const [isModalOpenVip, setIsModalOpenVip] = useState(false); // 是否是vip
  const [renewalOpen, setRenewalOpen] = useState(false); // 续费提醒
  const [showSettingsModal, setShowSettingsModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

  const [exitOpen, setExitOpen] = useState(false); // 是否关闭主程序
  const [accelOpen, setAccelOpen] = useState(false); // 是否确认退出登录
  const [isAppCloseOpen, setIsAppCloseOpen] = useState(false); // 是否手动设置关闭主程序操作

  const menuList: CustomMenuProps[] = [
    {
      key: "home",
      label: "首页",
      router: "/home",
    },
    {
      key: "gameLibrary",
      label: "游戏库",
      router: "/gameLibrary",
    },
  ];

  const loginOutStop = async () => {
    await playSuitApi.playSpeedEnd({
      platform: 3,
      js_key: localStorage.getItem("StartKey"),
    }); // 游戏停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        removeGameList("initialize"); // 更新我的游戏
        loginOut();
        // (window as any).loginOut();
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };
  // // 挂载到 window 对象上
  // (window as any).loginOutStop = loginOutStop;
  const loginOut = async (type = "default") => {
    let res = await loginApi.loginOut();

    if (res.error === 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("isRealName");

      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo({}, false, false));
      navigate("/home");
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
    playSuitApi.playSpeedEnd({
      platform: 3,
      js_key: localStorage.getItem("StartKey"),
    }); // 游戏停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        removeGameList("initialize"); // 更新我的游戏
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        (window as any).NativeApi_ExitProcess();
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  const handleMinimize = () => {
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

  function compareVersions(version1: string, version2: string) {
    // 将版本号按点号分割成数组
    const parts1 = version1.split(".").map(Number);
    const parts2 = version2.split(".").map(Number);

    // 获取最长的版本号长度
    const maxLength = Math.max(parts1.length, parts2.length);

    // 循环比较每个部分
    for (let i = 0; i < maxLength; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 <= num2) {
        return true; // 如果前者小于后者版本，返回 true
      }
    }

    // 如果前者不小于后者版本，返回false
    return false;
  }

  // 停止加速
  const stopProxy = () => {
    playSuitApi.playSpeedEnd({
      platform: 3,
      js_key: localStorage.getItem("StartKey"),
    }); // 游戏停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        historyContext?.accelerateTime?.stopTimer();
        removeGameList("initialize"); // 更新我的游戏
        navigate("/home");
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  const stopSpeed = () => {  //全局只给客户端调用，业务不处理
    playSuitApi.playSpeedEnd({
      platform: 3,
      js_key: localStorage.getItem("StartKey"),
    }); // 游戏停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        historyContext?.accelerateTime?.stopTimer();
        removeGameList("initialize"); // 更新我的游戏
        navigate("/home");
        (window as any).NativeApi_ExitProcess();
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  (window as any).stopSpeed = stopSpeed;

  const showSettingsForm = () => { //给客户端用的设置弹展示方法
    setShowSettingsModal(true)
  }
  (window as any).showSettingsForm = showSettingsForm;

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      // console.log(data,"ws返回的信息---------------")
      // const version = data?.data?.version;

      // let isTrue = compareVersions(version?.min_version, version?.now_version);

      // if (isTrue) {
      //   stopProxy();
      //   eventBus.emit("showModal", {
      //     show: true,
      //     type: "newVersionFound",
      //     version: version?.now_version,
      //   });
      //   return;
      // }

      if (data.code === "110001" || data.code === 110001) {
        loginOutStop();
      } else if (data.code === 0 || data.code === "0") {
        let userInfo = data?.data?.user_info || {};
        if (
          !accountInfo?.userInfo?.user_ext?.is_adult ||
          (accountInfo?.userInfo?.user_ext?.name === "" &&
            accountInfo?.userInfo?.user_ext?.idcard === "")
        ) {
          localStorage.setItem("isRealName", "1");
        } else {
          localStorage.setItem("isRealName", "0");
        }

        if (String(userInfo?.phone)?.length > 1) {
          // 3个参数 用户信息 是否登录 是否显示登录
          dispatch(setAccountInfo(userInfo, true, false));

          // 加速中并且会员到期 停止加速
          if (identifyAccelerationData()?.[0] && !userInfo?.is_vip) {
            stopProxy();
            eventBus.emit("showModal", {
              show: true,
              type: "accelMemEnd",
            });
          }
        } else {
          if (!isBindPhone) {
            dispatch(updateBindPhoneState(true));
          }
        }
      }
    };

    const url = "wss://test-api.accessorx.com/ws/v1/user/info";
    webSocketService.connect(url, handleWebSocketMessage, dispatch);
    return () => {
      webSocketService.close();
    };
  }, [dispatch]);

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
    const handleGlobalError = (event:any) => {
      console.error('Global error handler:', event);
      if (event.message === 'Network Error' || (event.error && event.error.message === 'Network Error')) {
        eventBus.emit('showModal', { show: true, type: "netorkError" });
        event.preventDefault(); // 阻止默认处理
      }
    };

    const handleUnhandledRejection = (event:any) => {
      console.error('Global unhandledrejection handler:', event);
      if (event.reason.message === 'Network Error' || (event.reason && event.reason.message === 'Network Error')) {
        eventBus.emit('showModal', { show: true, type: "netorkError" });
        event.preventDefault(); // 阻止默认处理
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
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
                  state?.menu === item?.router && "menu-active"
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
              <img src={menuIcon} alt="" />
            </Dropdown>
            <img
              onClick={handleMinimize}
              className="minType"
              src={minIcon}
              alt=""
            />
            <img
              onClick={() => {
                if (localStorage.getItem("close_window_sign") !== "1") {
                  let isSet = localStorage.getItem("settingsModified"); // 是否手动设置过关闭弹窗
                  if (Boolean(isSet)) {
                    setExitOpen(true);
                  } else {
                    setIsAppCloseOpen(true);
                  }
                } else {
                  (window as any).NativeApi_MinimizeToTray();
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

      {accountInfo?.isShowLogin && (
        <div
          className="login-mask"
          style={{ display: accountInfo?.isShowLogin ? "none" : "block" }}
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
            setIsModalOpenVip(true);
          }}
        />
      ) : null}
      {/* 提示修改关闭窗口设置 */}
      {isAppCloseOpen ? (
        <AppCloseModal open={isAppCloseOpen} close={setIsAppCloseOpen} />
      ) : null}
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
