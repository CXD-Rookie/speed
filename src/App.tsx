import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { connect, useDispatch, useSelector } from "react-redux";
import { menuActive } from "./redux/actions/menu";
import { setAccountInfo } from "./redux/actions/account-info";
import { stopAccelerate } from "./redux/actions/auth";

import "@/assets/css/App.scss";
import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import SettingsModal from "./containers/setting/index";
import IssueModal from "./containers/IssueModal/index";

import playSuitApi from "./api/speed";
import loginApi from "./api/login";

import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import closeIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.svg";
import { getMyGames } from "./common/utils";

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

  const routeView = useRoutes(routes); // 获得路由表

  const isStop = useSelector((state: any) => state.auth.isStop);
  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const [showSettingsModal, setShowSettingsModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

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
    const requestData = JSON.stringify({
      method: "NativeApi_StopProxy",
      params: null,
    });
    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("停止加速----------:", response);
        loginOut();
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("加速失败 failed:", errorMessage);
      },
    });
  };

  const loginOut = async () => {
    console.log("退出", "stop speed--------------------------");
    let res = await loginApi.loginOut();
    if (res.error === 0) {
      console.log("退出成功");
      let arr = getMyGames();

      arr = arr.map((item: any) => ({
        ...item,
        is_accelerate: false,
      }));

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));
      localStorage.removeItem("token");
      localStorage.removeItem("isRealName");
      dispatch(stopAccelerate(false));
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo({}, false, false));
      window.location.reload();
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
              <div className="public-style" onClick={loginOutStop}>
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
    console.log("stop speed--------------------------");
    const requestData = JSON.stringify({
      method: "NativeApi_StopProxy",
      params: null,
    });
    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("停止加速----------:", response);
        (window as any).NativeApi_ExitProcess();

        // if ((window as any).NativeApi_ExitProcess) {
        //   (window as any).NativeApi_ExitProcess();
        // } else {
        //   console.warn("NativeApi_ExitProcess is not defined");
        // }
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("加速失败 failed:", errorMessage);
      },
    });
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
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
