import React, { useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { SlackOutlined } from "@ant-design/icons";
import { Layout, theme, Input } from "antd";

import { connect } from "react-redux";
import { menuActive } from "./redux/actions/menu";

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
    key: "home",
    label: "首页",
    router: "home",
    is_active: true,
  },
  {
    key: "gamelist",
    label: "游戏库",
    router: "gamelist",
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
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { state, setMenuActive } = props;
  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表

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

  return (
    <Layout className="app-module">
      <Header className="header">
        <SlackOutlined className="header-icon" />
        <div className="header-functional-areas">
          <div className="menu-list">
            {menuList.map((item) => (
              <div
                key={item?.key}
                className={`menu ${state?.menu === item?.key && "menu-active"}`}
                onClick={() => handleChangeTabs(item)}
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
        </div>
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
