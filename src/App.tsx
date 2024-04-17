import React, { useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { NotificationOutlined } from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";

import type { MenuProps } from "antd";

import routes from "./routes/index";

const { Header, Content, Sider } = Layout;

const titleMenu: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
  key,
  label: `标题 ${key}`,
}));

const siderMenu: MenuProps["items"] = [
  {
    key: "about",
    icon: <NotificationOutlined />,
    label: "关于系统",
  },
  // {
  //   key: "info",
  //   icon: <LaptopOutlined />,
  //   label: "信息管理",
  //   children: [
  //     {
  //       key: "info-detail",
  //       label: "信息详情",
  //     },
  //     {
  //       key: "info-look",
  //       label: "信息查询",
  //     },
  //   ],
  // },
];

const App: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const routeView = useRoutes(routes); // 获得路由表

  const [breadcrumbName, setBreadcrumbName] = useState("home"); // 面包屑名称

  // 点击菜单
  const handleSiderClick: MenuProps["onClick"] = ({ key, keyPath }) => {
    const name = keyPath.reverse().join("/") || "";

    setBreadcrumbName(name);

    if (key !== "home" && key !== "about") return;

    // 路由跳转
    navigate(key, {
      replace: false,
      state: {
        id: key,
      },
    });
  };

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={titleMenu}
        />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={siderMenu}
            onClick={handleSiderClick}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <div style={{ margin: "16px 0" }}>{breadcrumbName}</div>
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
    </Layout>
  );
};

export default App;
