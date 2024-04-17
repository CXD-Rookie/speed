import React, { useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { NotificationOutlined, SlackOutlined } from "@ant-design/icons";
import { Layout, theme, Tabs, Input } from "antd";

import type { MenuProps } from "antd";

import routes from "./routes/index";
import Login from "./containers/Login/index";

import "@/assets/css/App.scss";

const { Header, Content } = Layout;

// const items: TabsProps["items"] = [
//   {
//     key: "1",
//     label: "首页",
//     children: "",
//   },
//   {
//     key: "2",
//     label: "游戏库",
//     children: "",
//   },
// ];

const siderMenu: MenuProps["items"] = [
  {
    key: "gameList",
    icon: <NotificationOutlined />,
    label: "gameList",
  },
];

const App: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表

  const [breadcrumbName, setBreadcrumbName] = useState("home"); // 面包屑名称

  // 点击菜单
  const handleChangeTabs = () => {
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
          {/* <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={handleChangeTabs}
          /> */}
          <div onClick={handleChangeTabs}>游戏库</div>
          <Input
            className="search-input"
            size="large"
            placeholder="搜索游戏"
            // prefix={<UserOutlined />}
          />
          <div>设置</div>
        </div>
      </Header>
      <Layout>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {routeView}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
