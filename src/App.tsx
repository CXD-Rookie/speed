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

  useEffect(() => {
    setMenuActive(location?.pathname);
  }, [location]);

  return (
    <Layout className="app-module">
      <Header className="header">
        <SlackOutlined className="header-icon" />
        <div className="header-functional-areas">
          <div className="menu-list">
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

          <div className="personal-information">
            {isLogin ? <CustomDropdown /> : <div>登录/注册</div>}
            <Dropdown
              overlayClassName={"dropdown-overlay"}
              menu={{ items }}
              placement="bottomRight"
            >
              <img src={menuIcon} width={12} height={12} alt="" />
            </Dropdown>
            <img src={minIcon} width={12} height={12} alt="" />
            <img src={closeIcon} width={12} height={12} alt="" />
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
