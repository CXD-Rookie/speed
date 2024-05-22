import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { SlackOutlined } from "@ant-design/icons";
import { Layout, Input } from "antd";

import { connect } from "react-redux";
import { menuActive } from "./redux/actions/menu";

import routes from "./routes/index";
import SearchBar from "./containers/searchBar/index";
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
    router: "/home",
  },
  {
    key: "gameLibrary",
    label: "游戏库",
    router: "/gameLibrary",
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
  if (isLogin === "" ||   isLogin === null || isLogin === undefined || isLogin === "undefined") {
      localStorage.setItem("isLogin","false");
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
          {/* <Input className="search-input" size="large" placeholder="搜索游戏" /> */}
          <div className="personal-information">
            <div>登录/注册</div>
          </div>
        </div>
      </Header>
      <Layout>
        <Content className="content">{routeView}</Content>
      </Layout>
      {isLogin === "false" &&<div
        className="login-mask"
        style={{ display: isLoginModal ? "none" : "none" }}
      >
        <Login setIsLoginModal={setIsLoginModal} />
      </div>
      }
    </Layout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
