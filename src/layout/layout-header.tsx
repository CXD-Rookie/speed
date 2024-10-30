import React, { useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveMenu } from "@/redux/actions/menu";
import { setAccountInfo } from "@/redux/actions/account-info";
import { useNavigate } from "react-router-dom";

import "./index.scss";
import SearchBar from "@/containers/searchBar";
import logoIcon from "@/assets/images/common/logo.png";

interface CustomMenuProps {
  key: string;
  label: string;
  router: string;
  routerList?: Array<string>;
  is_active?: boolean;
}

const menuList: CustomMenuProps[] = [
  {
    key: "home",
    label: "首页",
    router: "/home",
    routerList: ["/home", "/myGames", "/gameDetail"],
  },
  {
    key: "gameLibrary",
    label: "游戏库",
    router: "/gameLibrary",
    routerList: ["/gameLibrary"],
  },
];

const LayoutHeader: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch: any = useDispatch();

  // const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  // const menuState = useSelector((state: any) => state?.menu?.active_menu); // 头部tab状态

  // const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
  //   e.stopPropagation();
  // };
  
  // // 切换tab选中路由更新redux值
  // const handleChangeTabs = (item: any) => {
  //   let localtion = item?.router || "/home";
    
  //   dispatch(setActiveMenu(item?.router));
  //   navigate(localtion, {
  //     replace: false,
  //     state: {
  //       id: item,
  //     },
  //   });
  // };
  
  // // 点击口令兑换
  // const onClickCurrency = () => {
  //   // 如果是登录状态允许触发弹窗
  //   if (accountInfo?.isLogin) {
  //     // setCurrencyOpen(true);
  //   } else {
  //     // 3个参数 用户信息 是否登录 是否显示登录
  //     dispatch(setAccountInfo(undefined, undefined, true));
  //   }
  // }

  // useEffect(() => {
  //   navigate(menuState);
  // }, []);

  return (
    <Fragment>
      <SearchBar />
      {/* LOGO */}
      {/* <img
        className="header-icon"
        src={logoIcon}
        width={40}
        height={40}
        alt=""
      /> */}
      <div className="header-functional-areas">
        {/* 切换标签tabs */}
        {/* <div
          className="menu-list"
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        >
          {menuList.map((item) => (
            <div
              key={item?.key}
              className={`menu ${
                item?.routerList?.includes(menuState) && "menu-active"
              }`}
              onClick={() => handleChangeTabs(item)}
            >
              {item?.label}
            </div>
          ))}
        </div> */}
        {/* 搜索框 */}
        {/* <div onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
          <SearchBar />
        </div> */}
        {/* <div
          className="personal-information"
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        > */}
          {/* 口令兑换弹窗 */}
          {/* <div className="currency-exchange" onClick={onClickCurrency}>
            口令兑换
          </div> */}
        {/* </div> */}
      </div>
    </Fragment>
  );
};

export default LayoutHeader;
