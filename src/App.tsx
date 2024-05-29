import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { connect, useDispatch, useSelector } from "react-redux";
import { menuActive } from "./redux/actions/menu";
import { setIsLogin } from "./redux/actions/auth";
import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import SettingsModal from "./containers/setting/index";
import IssueModal from "./containers/IssueModal/index";
import "@/assets/css/App.scss";
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
  cefQuery: ({}) => void; //不用管
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
  const dispatch = useDispatch();
  const isLogin = useSelector((state: any) => state.auth.isLogin);
  const location = useLocation();
  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表
  const [isRealityLogin, setIsRealityLogin] = useState(false); // 实际是否登录 控制状态

  const [isLoginModal, setIsLoginModal] = useState(0);
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
    {
      key: "2",
      label: (
        <div className="public-style" onClick={() => setShowIssueModal(true)}>
          问题反馈
        </div>
      ),
    },
    {
      type: "divider", // 使用 Menu.Divider
    },
    {
      key: "3",
      label: <div className="public-style">退出登录</div>,
    },
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
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin === "true") {
      // setIsLogin(true);
      dispatch(setIsLogin(true));
      setIsRealityLogin(true);
    } else {
      localStorage.setItem("isLogin", "false");
      dispatch(setIsLogin(false));
      setIsRealityLogin(false);
    }
  }, [isLoginModal]);

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

          <SearchBar />

          <div
            className="personal-information"
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
          >
            {isRealityLogin ? (
              <CustomDropdown />
            ) : (
              <div
                className="login-enroll-text"
                onClick={() => setIsLoginModal(isLoginModal + 1)}
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
              onClick={handleExitProcess}
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

      {isLogin && (
        <div
          className="login-mask"
          style={{ display: isLogin ? "none" : "block" }}
        >
          <Login
            isLoginModal={isLoginModal}
            setIsLoginModal={setIsLoginModal}
          />
        </div>
      )}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      {showIssueModal && <IssueModal />}
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
