import React, { useEffect } from "react";
import { Layout } from "antd";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";

import "./index.scss";
import LayoutHeader from "./layout-header";
import routes from "@/routes";
import SearchBar from "@/containers/searchBar";

const { Header, Content } = Layout;

const Layouts: React.FC = () => {
  const routeView = useRoutes(routes); // 获得路由表

  const handleMouseDown = () => {
    (window as any).NativeApi_OnDragZoneMouseDown();
  };

  const handleMouseUp = () => {
    (window as any).NativeApi_OnDragZoneMouseUp();
  };

  useEffect(() => {
    // 检查当前文档是否已经加载完毕
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      localStorage.removeItem("isAccelLoading");
      // 如果 DOM 已经加载完毕，直接执行
      setTimeout(() => {
        (window as any).NativeApi_RenderComplete();
      }, 1000);
    } else {
      // 否则监听 DOMContentLoaded 事件
      document.addEventListener(
        "DOMContentLoaded",
        (window as any).NativeApi_RenderComplete()
      );

      // 清理函数
      return () => {
        document.removeEventListener(
          "DOMContentLoaded",
          (window as any).NativeApi_RenderComplete()
        );
      };
    }
  }, []);

  return (
    <Layout className="app-module">
      <Header
        className="app-header"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <SearchBar />
        {/* <LayoutHeader /> */}
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
    </Layout>
  );
};

export default Layouts;