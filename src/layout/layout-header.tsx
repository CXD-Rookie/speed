import React, { Fragment, useEffect } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setActiveMenu } from "@/redux/actions/menu";
import { setAccountInfo } from "@/redux/actions/account-info";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import {
  setCurrencyOpen,
  setSetting,
  setFeedbackPopup,
  setAppCloseOpen,
  setVersionState,
} from "@/redux/actions/modal-open";

import "./index.scss";
import eventBus from "@/api/eventBus";
import SearchBar from "@/containers/searchBar";
import CustomDropdown from "@/containers/login-user";

import menuIcon from "@/assets/images/common/menu.svg";
import minIcon from "@/assets/images/common/min.svg";
import closeIcon from "@/assets/images/common/cloture.svg";
import updateIcon from "@/assets/images/common/update.png";

interface CustomMenuProps {
  key: string;
  label: string;
  router: string;
  routerList?: Array<string>;
  is_active?: boolean;
}

interface HeaderProps {
  couponRefreshNum?: number;
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

const LayoutHeader: React.FC<HeaderProps> = (props) => {
  const { couponRefreshNum } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: any = useDispatch();
  const is_local = process.env.REACT_APP_LOACL_IMAGE === "0";
  // 动态导入图片
  const logoUrl =
    is_local && process.env.REACT_APP_IMAGE_LOGO
      ? typeof require(process.env.REACT_APP_IMAGE_LOGO as string) === "string"
        ? require(process.env.REACT_APP_IMAGE_LOGO as string)
        : require(process.env.REACT_APP_IMAGE_LOGO as string).default
      : process.env.REACT_APP_IMAGE_LOGO || "";

  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  const { type: versionType = "" } = useSelector(
    (state: any) => state?.modalOpen?.versionState
  );
  const menuState = useSelector((state: any) => state?.menu?.active_menu); // 头部tab状态
  
  const { identifyAccelerationData } = useGamesInitialize();

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  
  const handleMinimize = async () => {
    (window as any).NativeApi_MinimumWindow();
  };

  // 点击右上角关闭主程序按钮触发逻辑
  const onClickOff = () => {
    let close = localStorage.getItem("client_settings");
    let action = close ? JSON.parse(close)?.close_button_action : 2;
    let noMorePrompts = localStorage.getItem("noMorePrompts");
    
    // 0 最小化托盘 1 关闭主程序 2 或没值弹窗提示框
    // 如果当前游戏是加速中并且是关闭主程序
    if (
      action === 1 &&
      identifyAccelerationData()?.[0] &&
      String(noMorePrompts) === "true"
    ) {
      //确定要退出加速器弹窗
      eventBus.emit("showModal", { show: true, type: "exit" });
    } else {
      // 提示存在
      if (!(String(noMorePrompts) === "true")) {
        dispatch(setAppCloseOpen(true))
      } else {
        if (action === 0) {
          (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
        } else if (
          action === 1 &&
          localStorage.getItem("isAccelLoading") !== "1" // 加速中点击无效
        ) {
          (window as any).NativeApi_ExitProcess(); //关闭主程序
        }
      }
    }
  }

  // 切换tab选中路由更新redux值
  const handleChangeTabs = (item: any) => {
    let localtion = item?.router || "/home";
    
    dispatch(setActiveMenu(item?.router));
    navigate(localtion, {
      replace: false,
      state: {
        id: item,
      },
    });
  };
  
  // 点击口令兑换
  const onClickCurrency = () => {
    // 如果是登录状态允许触发弹窗
    if (accountInfo?.isLogin) {
      dispatch(setCurrencyOpen(true));
    } else {
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, undefined, true));
    }
  }

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          className="public-style"
          onClick={() => dispatch(setSetting({ settingOpen: true }))}
        >
          设置
        </div>
      ),
    },
    // 只有当 token 存在时才显示 "问题反馈" 这一项
    ...(accountInfo?.isLogin
      ? ([
          {
            key: "2",
            label: (
              <div
                className="public-style feedback-public-style"
                onClick={() => dispatch(setFeedbackPopup({ open: true }))}
              >
                问题反馈
              </div>
            ),
          },
          {
            type: "divider",
          },
          {
            key: "3",
            label: (
              <div
                className="public-style"
                onClick={() =>
                  eventBus.emit("showModal", {
                    show: true,
                    type: "loginOut",
                  })
                }
              >
                退出登录
              </div>
            ),
          },
        ] as any)
      : []),
  ];

  useEffect(() => {
    if (location) {
      dispatch(setActiveMenu(location?.pathname));
    }
  }, [location]);

  return (
    <Fragment>
      {/* LOGO */}
      <img
        className="header-icon"
        src={logoUrl}
        width={40}
        height={40}
        alt=""
      />
      <div className="header-functional-areas">
        {/* 切换标签tabs */}
        <div
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
        </div>

        {/* 搜索框 */}
        <div
          style={{ marginLeft: accountInfo?.isLogin ? "-0.4vw" : "3.6vw" }}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        >
          <SearchBar />
        </div>
        <div
          className="personal-information"
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        >
          {/* 发现新版本 */}
          {versionType && (
            <div
              className="find-version"
              onClick={() =>
                // 打开升级弹窗 触发普通升级类型
                dispatch(setVersionState({ open: true }))
              }
            >
              <img src={updateIcon} alt="" />
              发现新版本
            </div>
          )}
          {/* 口令兑换弹窗 */}
          <div className="currency-exchange" onClick={onClickCurrency}>
            口令兑换
          </div>
          {accountInfo?.isLogin ? (
            <CustomDropdown isCouponRefresh={couponRefreshNum} />
          ) : (
            <div
              className="login-enroll-text"
              onClick={() =>
                dispatch(setAccountInfo(undefined, undefined, true))
              }
            >
              登录/注册
            </div>
          )}
          {/* 设置 */}
          <Dropdown
            overlayClassName="layout-setting"
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <img className="minType" src={menuIcon} alt="" />
          </Dropdown>
          {/* 最小化 */}
          <img
            onClick={handleMinimize}
            className="minType"
            src={minIcon}
            alt=""
          />
          {/* 关闭 */}
          <img
            className="closeType"
            onClick={onClickOff}
            src={closeIcon}
            alt=""
          />
        </div>
      </div>
    </Fragment>
  );
};

export default LayoutHeader;
