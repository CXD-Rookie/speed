import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { SlackOutlined } from "@ant-design/icons";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";

import { connect } from "react-redux";
import { menuActive } from "./redux/actions/menu";

import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
import Login from "./containers/Login/index";
import CustomDropdown from "@/containers/login-user";
import "@/assets/css/App.scss";

import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import closeIcon from "@/assets/images/common/cloture.svg";

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
  cefQuery: ({ }) => void; //不用管
}

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
    label: <div className="public-style">设置</div>,
  },
  {
    key: "2",
    label: <div className="public-style">问题反馈</div>,
  },
  {
    type: "divider", // 使用 Menu.Divider
  },
  {
    key: "3",
    label: <div className="public-style">退出登录</div>,
  },
];

const mapStateToProps = (state: any) => ({
  // Map state to props if needed
  state,
});

const mapDispatchToProps = (dispatch: any) => ({
  setMenuActive: (payload: any) => dispatch(menuActive(payload)),
});

const App: React.FC = (props: any) => {
  const { state, setMenuActive } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表

  const isLogin = localStorage.getItem("isLogin");

  if (
    isLogin === "" ||
    isLogin === null ||
    isLogin === undefined ||
    isLogin === "undefined"
  ) {
    localStorage.setItem("isLogin", "false");
  }

  const [isLoginModal, setIsLoginModal] = useState(true);

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
    if ((window as any).NativeApi_ExitProcess) {
      (window as any).NativeApi_ExitProcess();
    } else {
      console.warn("NativeApi_ExitProcess is not defined");
    }
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

  return (
    <Layout className="app-module">
      <Header className="header" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        <SlackOutlined className="header-icon" />
        <div className="header-functional-areas"  >
          <div className="menu-list" onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
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

          <div className="personal-information" onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
            {isLogin ? <CustomDropdown /> : <div>登录/注册</div>}
            <Dropdown
              overlayClassName={"dropdown-overlay"}
              menu={{ items }}
              placement="bottomRight"
            >
              <img src={menuIcon} width={12} height={12} alt="" />
            </Dropdown>
            <img  className="minType" src={minIcon} width={12} height={12} alt="" />
            <img onClick={handleExitProcess} className="closeType" src={closeIcon} width={12} height={12} alt="" />
          </div>
        </div>
        
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
      {isLogin === "false" && (
        <div
          className="login-mask"
          style={{ display: isLoginModal || isLogin ? "none" : "block" }}
        >
          <Login setIsLoginModal={setIsLoginModal} />
        </div>
      )}
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
