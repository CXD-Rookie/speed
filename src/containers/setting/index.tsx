/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-23 18:41:27
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState, useEffect } from "react";
import { Modal, Tabs, Switch, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { validateRequiredParams, copyToClipboard } from "@/common/utils";
import {
  setSetting,
  setPayState,
  setMinorState,
  setBindState,
} from "@/redux/actions/modal-open";
import "./index.scss";
import BaseRadio from "@/components/base-radio";
import tracking from "@/common/tracking";
import UserAvatarCom from "../login-user/user-avatar";
import RealNameModal from "../real-name";
import toast from "@/components/base-toast";
import fixImg from "@/assets/images/fix-utils/fix@2x.png";
import fixImg_3 from "@/assets/images/fix-utils/fix3@2x.png";
import fixImg_6 from "@/assets/images/fix-utils/fix6@2x.png";
import fixImg_success from "@/assets/images/fix-utils/fix_success@2x.png";
import fix_failure from "@/assets/images/fix-utils/fix_failure@2x.png";
import loginApi from "@/api/login";
import copyIcon from "@/assets/images/common/copy.png";
import loadingGif from "@/assets/images/common/jiazai.gif";

const { TabPane } = Tabs;
const signChannel = [
  "berrygm",
  "ali213",
  "accessorx",
  "dualspring",
  "jsqali213",
  "baidu",
];

const SettingsModal: React.FC = (props) => {
  const { settingOpen = false, type = "default" } = useSelector((state: any) => state?.modalOpen?.setting);
  const accountInfo = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);
  const payOpen = useSelector((state: any) => state?.modalOpen?.payState?.open);
  const localMchannel = localStorage.getItem("mchannel") ?? "";
  const mchannel = signChannel.includes(localMchannel)
    ? localMchannel
    : "other";
  const user_id = localStorage.getItem("userId");
  const website_url = process.env.REACT_APP_WEBSITE_URL;

  const historyContext: any = useHistoryContext();
  const { removeGameList } = useGamesInitialize();

  const [loading, setLoading] = React.useState<boolean>(true);

  const [versionNow, setVersionNow] = useState(""); //
  const [activeTab, setActiveTab] = useState("system");

  // 从 localStorage 获取初始值，如果没有则默认值为 "2"
  const initialCloseWindow = () => {
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    const closeButtonAction = sign?.close_button_action;
    return String(closeButtonAction === 1 ? 1 : 2);
  };

  const [closeWindow, setCloseWindow] = useState<string>(initialCloseWindow);

  const [isRealNameTag, setRealNameTag] = useState<any>("");

  const [thirdInfo, setThirdInfo] = useState([]);

  const [startAutoLaunch, setStartAutoLaunch] = useState(true); // 开始自动启动
  const [desktopQuickStart, setDesktopQuickStart] = useState(true); // 桌面快捷启动

  const dispatch = useDispatch();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onClose = () => {
    dispatch(setSetting({ settingOpen: false, type: "default" }));
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    
    (window as any).NativeApi_OpenBrowser(dataTitle);
  };

  const native_fixup_network_lsp = () => {
    return new Promise((resolve, reject) => {
      console.log("Fixing network LSP");
      (window as any).NativeApi_AsynchronousRequest(
        "FixupNetworkLsp",
        "",
        (response: string) => {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.success === 1) {
            resolve(parsedResponse);
          } else {
            reject(parsedResponse);
          }
        }
      );
    });
  };

  const native_fixup_network_host = () => {
    return new Promise((resolve, reject) => {
      console.log("Fixing network HOST");
      (window as any).NativeApi_AsynchronousRequest(
        "FixupNetworkHosts",
        "",
        (response: string) => {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.success === 1) {
            resolve(parsedResponse);
          } else {
            reject(parsedResponse);
          }
        }
      );
    });
  };

  const native_fixup_network_dns = () => {
    return new Promise((resolve, reject) => {
      console.log("Fixing network DNS");
      (window as any).NativeApi_AsynchronousRequest(
        "FixupNetworkDns",
        "",
        (response: string) => {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.success === 1) {
            resolve(parsedResponse);
          } else {
            reject(parsedResponse);
          }
        }
      );
    });
  };

  const native_restart = () => {
    console.log("Restarting");
    let jsonString = "";

    const userToken = localStorage.getItem("token");
    const jsKey = localStorage.getItem("StartKey");

    if (jsKey) {
      jsonString = JSON.stringify({
        params: {
          user_token: userToken ? JSON.parse(userToken) : "",
          js_key: jsKey,
        },
      });
    }
    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_StopProxy",
      jsonString,
      async function (response: any) {
        console.log(response, "----------------------------------");
        let list = (await removeGameList("initialize")) || []; // 更新我的游戏
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        if (list?.length >= 0) {
          (window as any).NativeApi_ExitProcess();
        }
      }
    );
    
    // 调用重启方法
    (window as any).native_restart();
  };

  const repairToolDetails = {
    修复LSP: {
      successContent: "修复成功，需要重启加速器生效",
      failureContent:
        "无法修复由于网络协议栈异常导致的问题，请检查您的代理设置或使用问题反馈联系技术支持。",
      okText: "立即重启",
      cancelText: "稍后再说",
      iconSuccess: (
        <img src={fixImg_success} alt="成功图标" className="modal-icon" />
      ),
      iconfailure: (
        <img src={fix_failure} alt="失败图标" className="modal-icon" />
      ),
      fixMethod: native_fixup_network_lsp,
    },
    Host清理: {
      successContent: "修复成功，需要重启加速器生效",
      failureContent:
        "无法修复因Host文件篡改导致的问题，请手动检查Host文件或使用问题反馈联系技术支持。",
      okText: "立即重启",
      cancelText: "稍后再说",
      iconSuccess: (
        <img src={fixImg_success} alt="成功图标" className="modal-icon" />
      ),
      iconfailure: (
        <img src={fix_failure} alt="失败图标" className="modal-icon" />
      ),
      fixMethod: native_fixup_network_host,
    },
    修复本地DNS: {
      successContent: "修复成功，需要重启加速器生效",
      failureContent:
        "无法修复本地DNS设置导致的问题，请检查您的DNS设置或使用问题反馈联系技术支持。",
      okText: "立即重启",
      cancelText: "稍后再说",
      iconSuccess: (
        <img src={fixImg_success} alt="成功图标" className="modal-icon" />
      ),
      iconfailure: (
        <img src={fix_failure} alt="失败图标" className="modal-icon" />
      ),
      fixMethod: native_fixup_network_dns,
    },
  };

  const openModal = async (title: string) => {
    const repairDetail = (repairToolDetails as any)[title];

    if (!repairDetail) {
      console.error(`无效修复: ${title}`);
      return;
    }

    const {
      successContent,
      failureContent,
      okText,
      cancelText,
      iconSuccess,
      iconfailure,
      fixMethod,
    } = repairDetail;

    try {
      await fixMethod();
      Modal.confirm({
        title: (
          <div className="modal-header">
            <div className="modal-subtitle">{"提示"}</div>
          </div>
        ),
        content: (
          <div className="fix-modal-content">
            {iconSuccess}
            <p>{successContent}</p>
          </div>
        ),
        okText,
        cancelText,
        className: "popup-success-fix",
        closable: true,
        closeIcon: <span>&times;</span>,
        onOk: () => {
          if (okText === "立即重启") {
            native_restart();
          }
          console.log("Modal closed");
        },
        onCancel: () => {
          console.log("Modal cancelled");
        },
      });
    } catch (error) {
      Modal.confirm({
        title: (
          <div className="modal-header">
            <div className="modal-subtitle">{"提示"}</div>
          </div>
        ),
        content: (
          <div className="fix-modal-content">
            {iconfailure}
            <p>{failureContent}</p>
          </div>
        ),
        okText,
        cancelText,
        className: "popup-failure-fix",
        closable: true,
        closeIcon: <span>&times;</span>,
        onOk: () => {
          if (okText === "立即重启") {
            native_restart();
          }
          console.log("Modal closed");
        },
        onCancel: () => {
          console.log("Modal cancelled");
        },
      });
    }
  };

  const handleBindThirdInfo = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      let res = await loginApi.fetchBindThirdInfo({
        platform: 3,
      });

      setThirdInfo(res?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRadioChange = (e: any) => {
    const value = e;
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    const action_value = value === "2" ? 1 : 0;

    sign.close_button_action = action_value; // 1 表示关闭程序，0 表示隐藏到托盘

    console.log("Updated client_settings in localStorage:", sign);

    setCloseWindow(value);
    localStorage.setItem("noMorePrompts", String(true));
    localStorage.setItem("client_settings", JSON.stringify(sign));
    (window as any).NativeApi_UpdateConfig("close_button_action", action_value);
  };

  const native_version = () => {
    return new Promise((resolve, reject) => {
      console.log("Fixing network LSP");
      (window as any).NativeApi_AsynchronousRequest(
        "QueryCurrentVersion",
        "",
        (response: string) => {
          const parsedResponse = JSON.parse(response);
          setVersionNow(parsedResponse.version);
        }
      );
    });
  };

  useEffect(() => {
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    let isRealName = localStorage.getItem("isRealName");
    isRealName = isRealName ? isRealName : "";
    const closeButtonAction = sign?.close_button_action;
    
    setCloseWindow(
      String(
        closeButtonAction !== undefined ? (closeButtonAction === 1 ? 2 : 1) : 2
      )
    );
    setStartAutoLaunch(!!sign?.auto_run);
    setDesktopQuickStart(!!sign?.auto_create_shortcut);
    setRealNameTag(isRealName);
  }, [settingOpen, payOpen, isRealOpen]);

  useEffect(() => {
    if (type === "edit") {
      setActiveTab("account");
    } else if (type === "fix") {
      setActiveTab("fix");
    }
  }, [type]);

  useEffect(() => {
    if (activeTab === "account") {
      handleBindThirdInfo();
    }
  }, [activeTab]);

  useEffect(() => {
    // 模拟一个异步操作，比如数据获取
    setTimeout(() => {
      setLoading(false);
    }, 2000); // 假设2秒后数据加载完毕
  }, []);

  useEffect(() => {
    native_version();
  }, [versionNow]);

  return (
    <Fragment>
      <Modal
        className="system-setting"
        open={settingOpen}
        onCancel={onClose}
        destroyOnClose
        title="设置"
        width={"67.6vw"}
        maskClosable={false}
        centered
        footer={null}
      >
        <Tabs
          className="tabActive"
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <TabPane tab="系统设置" key="system">
            <div className="tab-content">
              <div className="setting-item">
                <div className="item-title">常用设置</div>
                <div className="item-content">
                  <span>
                    开机自动启动
                    <Switch
                      value={startAutoLaunch}
                      onChange={(checked: boolean) => {
                        const check = checked ? 1 : 0;
                        const setting = JSON.parse(
                          localStorage.getItem("client_settings") || "{}"
                        );

                        setStartAutoLaunch(checked);

                        (window as any).NativeApi_UpdateConfig(
                          "auto_run",
                          check
                        );

                        setting.auto_run = check; // 1 表示关闭程序，0 表示隐藏到托盘
                        localStorage.setItem(
                          "client_settings",
                          JSON.stringify(setting)
                        );
                      }}
                    />
                  </span>
                  <span>
                    桌面快捷图标
                    <Switch
                      value={desktopQuickStart}
                      defaultChecked
                      onChange={(checked: boolean) => {
                        const check = checked ? 1 : 0;
                        const setting = JSON.parse(
                          localStorage.getItem("client_settings") || "{}"
                        );

                        setDesktopQuickStart(checked);
                        (window as any).NativeApi_UpdateConfig(
                          "auto_create_shortcut",
                          check
                        );

                        setting.auto_create_shortcut = check; // 1 表示关闭程序，0 表示隐藏到托盘
                        localStorage.setItem(
                          "client_settings",
                          JSON.stringify(setting)
                        );
                      }}
                    />
                  </span>
                </div>
              </div>
              <div className="setting-item">
                <div className="item-title">关闭窗口时</div>
                <div className="off-item-content">
                  <BaseRadio.Group
                    onChange={handleRadioChange}
                    value={closeWindow}
                  >
                    <BaseRadio value={"1"}>
                      <span style={{ color: "#fff", fontSize: "1.4vw" }}>
                        隐藏任务到托盘
                      </span>
                    </BaseRadio>
                    <BaseRadio value={"2"}>
                      <span style={{ color: "#fff", fontSize: "1.4vw" }}>
                        关闭程序
                      </span>
                    </BaseRadio>
                  </BaseRadio.Group>
                </div>
              </div>
              <div className="setting-item">
                <div className="item-title">关于</div>
                <div className="regard-item-content">版本号: {versionNow}</div>
              </div>
              <div className="setting-item">
                <div className="item-title">官网地址</div>
                <div
                  className="regard-item-content"
                  style={{
                    width: "fit-content",
                    color: "#FF4900",
                    cursor: "pointer",
                  }}
                  data-title={website_url}
                  onClick={handleClick}
                >
                  {website_url}
                </div>
              </div>
              <div className="protocols">
                <span
                  onClick={handleClick}
                  data-title={process.env.REACT_APP_TERMS_ADDRESS}
                >
                  用户协议
                </span>
                <span
                  onClick={handleClick}
                  data-title={process.env.REACT_APP_POLICY_ADDRESS}
                >
                  隐私协议
                </span>
                <span
                  onClick={handleClick}
                  data-title={process.env.REACT_APP_CHILDREN_ADDRESS}
                >
                  儿童保护及监护人须知
                </span>
                <span
                  onClick={handleClick}
                  data-title={process.env.REACT_APP_AUTOMATIC_ADDRESS}
                >
                  自动续费协议
                </span>
              </div>
            </div>
          </TabPane>
          {accountInfo?.isLogin && (
            <TabPane tab="账号设置" key="account">
              {loading ? (
                <div style={{ position: "relative", height: "60vh" }}>
                  <img
                    style={{
                      position: "absolute",
                      top: "29vh",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    src={loadingGif}
                    alt=""
                  />
                </div>
              ) : (
                <div className="tab-content">
                  <div className="tab-avatar">
                    <UserAvatarCom
                      isVip={accountInfo?.userInfo?.is_vip}
                      isLogin={accountInfo?.isLogin}
                      type={"setting"}
                    />
                    <div className="avatar-box">
                      <div className="avatar-name">
                        {accountInfo?.userInfo?.nickname}
                      </div>
                      {user_id && (
                        <div className="avatar-id">
                          ID：{user_id}
                          <img
                            className="copy-icon"
                            src={copyIcon}
                            alt=""
                            onClick={() => {
                              copyToClipboard(user_id);
                              toast.show({
                                message: "复制成功",
                                backgroundColor: "#222",
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="info-box info-flex">
                    <div className="info-left">
                      <label>手机号</label>
                      <div>{accountInfo?.userInfo?.phone}</div>
                    </div>
                    <div
                      className="real-name-btn"
                      onClick={() => {
                        dispatch(
                          setBindState({ open: true, type: "oldPhone" })
                        );
                      }}
                    >
                      修改
                    </div>
                  </div>
                  <div className="info-box info-flex">
                    <div className="info-left">
                      <label>游侠账号</label>
                      <div>
                        {thirdInfo?.some((item: any) => item?.source === 2)
                          ? "已绑定"
                          : "未绑定"}
                      </div>
                    </div>
                    {!thirdInfo?.some((item: any) => item?.source === 2) ? (
                      <div
                        className="real-name-btn"
                        onClick={() => {
                          dispatch(setBindState({ open: true, type: "third" }));
                        }}
                      >
                        绑定
                      </div>
                    ) : (
                      <div
                        className="real-name-btn"
                        onClick={() => {
                          dispatch(
                            setBindState({ open: true, type: "unbind" })
                          );
                        }}
                      >
                        解绑
                      </div>
                    )}
                  </div>
                  <div className="info-box info-flex">
                    <div className="info-left">
                      <label>实名认证</label>
                      {isRealNameTag === "1" ? (
                        <div>未认证</div>
                      ) : (
                        <div>已认证</div>
                      )}
                    </div>
                    {isRealNameTag === "1" && (
                      <div
                        className="real-name-btn"
                        onClick={() => dispatch(openRealNameModal())}
                      >
                        实名认证
                      </div>
                    )}
                  </div>
                  <div className="info-box info-flex">
                    <div className="info-left">
                      <label>会员到期时间</label>
                      {accountInfo?.userInfo?.is_vip ? (
                        <div>
                          {formatDate(
                            accountInfo?.userInfo?.vip_expiration_time -
                              86400 || 0
                          )}
                        </div>
                      ) : (
                        <div>非会员</div>
                      )}
                    </div>
                    {accountInfo?.userInfo.is_vip ? (
                      <div
                        onClick={() => {
                          const isRealNamel =
                            localStorage.getItem("isRealName");

                          if (isRealNamel === "1") {
                            dispatch(openRealNameModal());
                            return;
                          } else if (
                            !accountInfo?.userInfo?.user_ext?.is_adult
                          ) {
                            dispatch(
                              setMinorState({ open: true, type: "recharge" })
                            ); // 认证提示
                            return;
                          } else {
                            tracking.trackPurchasePageShow("settings");
                            dispatch(
                              setPayState({ open: true, couponValue: {} })
                            ); // 会员充值页面
                          }
                        }}
                        className="real-name-btn"
                      >
                        续费
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const isRealNamel =
                            localStorage.getItem("isRealName");

                          if (isRealNamel === "1") {
                            dispatch(openRealNameModal());
                            return;
                          } else if (
                            !accountInfo?.userInfo?.user_ext?.is_adult
                          ) {
                            dispatch(
                              setMinorState({ open: true, type: "recharge" })
                            ); // 认证提示
                            return;
                          } else {
                            tracking.trackPurchasePageShow("settings");
                            dispatch(
                              setPayState({ open: true, couponValue: {} })
                            ); // 会员充值页面
                          }
                        }}
                        className="real-name-btn"
                      >
                        充值
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabPane>
          )}
          <TabPane tab="修复工具" key="fix">
            <div className="repair-tool-container">
              <Card
                className="repair-tool"
                onClick={() => openModal("修复LSP")}
                bordered={false}
                hoverable
              >
                <div className="icon-placeholder">
                  <img src={fixImg} alt="修复LSP" />
                </div>
                <div className="cardName">
                  <div className="repair-tool-title">修复LSP</div>
                  <p className="repair-tool-description">
                    修复由于网络协议栈异常导致的应用程序无法连接、网络请求超时等问题
                  </p>
                </div>
              </Card>
              <Card
                className="repair-tool"
                onClick={() => openModal("Host清理")}
                bordered={false}
                hoverable
              >
                <div className="icon-placeholder">
                  <img src={fixImg_6} alt="Host清理" />
                </div>
                <div className="cardName">
                  <div className="repair-tool-title">Host清理</div>
                  <p className="repair-tool-description">
                    修复因Host文件篡改导致的应用访问失败问题
                  </p>
                </div>
              </Card>
              <Card
                className="repair-tool"
                onClick={() => openModal("修复本地DNS")}
                bordered={false}
                hoverable
              >
                <div className="icon-placeholder">
                  <img src={fixImg_3} alt="修复本地DNS" />
                </div>
                <div className="cardName">
                  <div className="repair-tool-title">修复本地DNS</div>
                  <p className="repair-tool-description">
                    修复因本地DNS设置错误导致的网络连接问题
                  </p>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
      {isRealOpen ? <RealNameModal /> : null}
    </Fragment>
  );
};

export default SettingsModal;
