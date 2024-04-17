import React, { useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { SlackOutlined } from "@ant-design/icons";
import { Layout, theme, Input } from "antd";

// import type { MenuProps } from "antd";

import routes from "./routes/index";
import Login from "./containers/Login/index";

import "@/assets/css/App.scss";

const { Header, Content } = Layout;

interface MenuProps {
  key: string;
  label: string;
  router: string;
  is_active?: boolean;
}

const menuList: MenuProps[] = [
  {
    key: "1",
    label: "首页",
    router: "home",
  },
  {
    key: "2",
    label: "游戏库",
    router: "gamelist",
    is_active: true,
  },
];

const App: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表

  // 点击菜单
  const handleChangeTabs = () => {
    // let localtion = item?.router || "home";
    navigate("gamelist", {
      replace: false,
      state: {
        id: "gamelist",
      },
    });
    // 路由跳转
    // navigate(key, {
    //   replace: false,
    //   state: {
    //     id: key,
    //   },
    // });
  };

  return (
    <Layout className="app-module">
      <Header className="header">
        <SlackOutlined className="header-icon" />
        <div className="header-functional-areas">
          <div className="menu-list">
            {menuList.map((item) => (
              <div
                className={`menu ${item?.is_active && "menu-active"}`}
                onClick={() => handleChangeTabs()}
              >
                {item?.label}
              </div>
            ))}
          </div>
          <Input
            className="search-input"
            size="large"
            placeholder="搜索游戏"
            // prefix={<UserOutlined />}
          />
          <div>{/* <Login /> */}</div>
        </div>
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
    </Layout>
  );
};

export default App;
