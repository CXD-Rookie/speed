import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { connect, useDispatch, useSelector } from "react-redux";
import { menuActive } from "./redux/actions/menu";
import { setAccountInfo } from "./redux/actions/account-info";
import { useGamesInitialize } from "./hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { setupInterceptors } from "./api/api";
import useCefQuery from "./hooks/useCefQuery";

import "@/assets/css/App.scss";
import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import SettingsModal from "./containers/setting/index";
import IssueModal from "./containers/IssueModal/index";
import BreakConfirmModal from "@/containers/break-confirm";

import playSuitApi from "./api/speed";
import loginApi from "./api/login";

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
  const { removeGameList } = useGamesInitialize();

  const routeView = useRoutes(routes); // 获得路由表

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const [showSettingsModal, setShowSettingsModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

  const [accelOpen, setAccelOpen] = useState(false); // 是否确认退出登录

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
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  const loginOut = async (type = "default") => {
    let res = await loginApi.loginOut();

    if (res.error === 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("isRealName");

      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo({}, false, false));
      // window.location.reload();
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

  const handleSuitDomList = async () => {
    try {
      let res = await playSuitApi.pcPlatform();
      console.log("获取运营平台信息", res.data[1]);
      const keys = Object.keys(res.data);
      console.log(keys);
      localStorage.setItem("pid", keys[0]);
      // 更新 state
      //@ts-ignore
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setMenuActive(location?.pathname);
  }, [location]);

  useEffect(() => {
    handleSuitDomList();
  }, []);

  useEffect(() => {
    setupInterceptors({
      historyContext,
      removeGameList,
    });
  }, [historyContext, removeGameList]);

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
                  handleExitProcess();
                } else {
                  handleMinimize();
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
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
