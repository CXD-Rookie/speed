/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-10 11:02:38
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState, useEffect } from "react";
import { Modal, Tabs, Button, Switch, Radio, Card, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";
import { useHandleUserInfo } from "@/hooks/useHandleUserInfo";
import { store } from "@/redux/store";

import "./index.scss";
import MinorModal from "../minor";
import UserAvatarCom from "../login-user/user-avatar";
import RealNameModal from "../real-name";
import PayModal from "../Pay";
import fixImg from "@/assets/images/fixUtils/fix@2x.png";
import fixImg_1 from "@/assets/images/fixUtils/fix1@2x.png";
import fixImg_2 from "@/assets/images/fixUtils/fix2@2x.png";
import fixImg_3 from "@/assets/images/fixUtils/fix3@2x.png";
import fixImg_6 from "@/assets/images/fixUtils/fix6@2x.png";
import fixImg_success from "@/assets/images/fixUtils/fix_success@2x.png";
import fix_failure from "@/assets/images/fixUtils/fix_failure@2x.png";
import BindPhoneMode from "../bind-phone-mode";
import loginApi from "@/api/login";
const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  type?: string;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose, type = "default" } = props;

  const { handleUserInfo } = useHandleUserInfo();

  const accountInfoRedux: any = useSelector((state: any) => state.accountInfo);
  const accountInfo = useSelector((state: any) => state.accountInfo);
  const version = useSelector((state: any) => state.version);
  const isLogin = useSelector((state: any) => state.isLogin);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const [isBindThirdOpen, setIsBindThirdOpen] = useState(false); // 手机号绑定第三方，切换手机号
  const [bindType, setBindType] = useState(""); // 绑定弹窗类型

  const [activeTab, setActiveTab] = useState("system");
  const [closeWindow, setCloseWindow] = useState<string>("2");

  const [isRealNameTag, setRealNameTag] = useState<any>("");
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

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

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
    console.log("data-title:", dataTitle);
  };
  const native_fixup_network_lsp = () => {
    return new Promise((resolve, reject) => {
        console.log("Fixing network LSP");
        (window as any).NativeApi_AsynchronousRequest(
            "FixupNetworkLsp",
            '',
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
            '',
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
            '',
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
    (window as any).native_restart();
    // 调用重启方法
  };

  const repairToolDetails = {
    修复LSP: {
        successContent: "您的问题已成功修复。",
        failureContent: "无法修复由于网络协议栈异常导致的问题，请检查您的代理设置或使用问题反馈联系技术支持。",
        okText: "立即重启",
        cancelText: "取消",
        iconSuccess: <img src={fixImg_success} alt="成功图标" className="modal-icon" />,
        iconfailure: <img src={fix_failure} alt="失败图标" className="modal-icon" />,
        fixMethod: native_fixup_network_lsp,
    },
    Host清理: {
        successContent: "您的问题已成功修复。",
        failureContent: "无法修复因Host文件篡改导致的问题，请手动检查Host文件或使用问题反馈联系技术支持。",
        okText: "立即重启",
        cancelText: "取消",
        iconSuccess: <img src={fixImg_success} alt="成功图标" className="modal-icon" />,
        iconfailure: <img src={fix_failure} alt="失败图标" className="modal-icon" />,
        fixMethod: native_fixup_network_host,
    },
    修复本地DNS: {
        successContent: "您的问题已成功修复。",
        failureContent: "无法修复本地DNS设置导致的问题，请检查您的DNS设置或使用问题反馈联系技术支持。",
        okText: "立即重启",
        cancelText: "取消",
        iconSuccess: <img src={fixImg_success} alt="成功图标" className="modal-icon" />,
        iconfailure: <img src={fix_failure} alt="失败图标" className="modal-icon" />,
        fixMethod: native_fixup_network_dns,
    },
};

  const openModal = async (title: string) => {
    const repairDetail = (repairToolDetails as any)[title];

    if (!repairDetail) {
        console.error(`无效修复: ${title}`);
        return;
    }

    const { successContent,failureContent, okText, cancelText, iconSuccess, iconfailure, fixMethod } = repairDetail;

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
      let res = await loginApi.fetchBindThirdInfo({
        platform: 3,
      });

      setThirdInfo(res?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    let isRealName = localStorage.getItem("isRealName");

    isRealName = isRealName ? isRealName : "";

    setCloseWindow(String(sign?.close_button_action || 2));
    setStartAutoLaunch(!!sign?.auto_run);
    setDesktopQuickStart(!!sign?.auto_create_shortcut);
    setRealNameTag(isRealName);
  }, [isOpen, isModalOpenVip, isRealOpen, isBindThirdOpen]);

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

//   useEffect(() => {
//  console.log(version.version.now_version,'版本信息----------------')
//   }, []);


  return (
    <Fragment>
      <Modal
        className="system-setting"
        open={isOpen}
        onCancel={onClose}
        destroyOnClose
        title="系统设置"
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
                        (window as any).NativeApi_UpdateConfig(
                          "auto_run",
                          checked ? 1 : 0
                        );
                        setStartAutoLaunch(checked);
                      }}
                    />
                  </span>
                  <span>
                    桌面快捷图标
                    <Switch
                      value={desktopQuickStart}
                      defaultChecked
                      onChange={(checked: boolean) => {
                        (window as any).NativeApi_UpdateConfig(
                          "auto_create_shortcut",
                          checked ? 1 : 0
                        );
                        setDesktopQuickStart(checked);
                      }}
                    />
                  </span>
                </div>
              </div>
              <div className="setting-item">
                <div className="item-title">关闭窗口时</div>
                <div className="off-item-content">
                  <Radio.Group
                    onChange={(e) => {
                      const value = e.target.value;

                      setCloseWindow(value);
                      (window as any).NativeApi_UpdateConfig(
                        "close_button_action",
                        String(value) === "1" ? 0 : 1
                      );
                    }}
                    value={closeWindow}
                  >
                    <Radio value={"1"}>隐藏任务到托盘</Radio>
                    <Radio value={"2"}>关闭程序</Radio>
                  </Radio.Group>
                </div>
              </div>
              <div className="setting-item">
                <div className="item-title">关于</div>
                <div className="regard-item-content">
                  版本号: {version.version.now_version}
                  {/* <Button type="default">检查新版本</Button> */}
                </div>
              </div>
              <div className="protocols">
                <span
                  onClick={handleClick}
                  data-title="https://cdn.accessorx.com/web/terms_of_service.html"
                >
                  用户协议
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://cdn.accessorx.com/web/privacy_policy.html"
                >
                  隐私协议
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://cdn.accessorx.com/web/children's_privacy.html"
                >
                  儿童保护及监护人须知
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://cdn.accessorx.com/web/automatic_renewal_agreement.html"
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
                  <Spin
                    size="large"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
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
                    <div className="avatar-name">
                      {accountInfo?.userInfo?.nickname}
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
                        console.log(accountInfo);

                        setBindType("oldPhone");
                        setIsBindThirdOpen(true);
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
                          ? "绑定"
                          : "未绑定"}
                      </div>
                    </div>
                    {!thirdInfo?.some((item: any) => item?.source === 2) ? (
                      <div
                        className="real-name-btn"
                        onClick={() => {
                          setBindType("third");
                          setIsBindThirdOpen(true);
                        }}
                      >
                        绑定
                      </div>
                    ) : (
                      <div
                        className="real-name-btn"
                        onClick={() => {
                          setBindType("unbind");
                          setIsBindThirdOpen(true);
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
                            setIsMinorOpen(true);
                            setMinorType("recharge");
                            return;
                          } else {
                            setIsModalOpenVip(true);
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
                            setIsMinorOpen(true);
                            setMinorType("recharge");
                            return;
                          } else {
                            setIsModalOpenVip(true);
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
                    修复病毒感染或被劫持导致的加速器安全问题
                  </p>
                </div>
              </Card>
              {/* <Card
                className="repair-tool"
                onClick={() => openModal("修复系统代理")}
                bordered={false}
                hoverable
              >
                <div className="icon-placeholder">
                  <img src={fixImg_1} alt="修复系统代理" />
                </div>
                <div className="cardName">
                  <div className="repair-tool-title">修复系统代理</div>
                  <p className="repair-tool-description">
                    修复系统配置代理导致无法加速等问题
                  </p>
                </div>
              </Card> */}
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
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {isRealOpen ? <RealNameModal /> : null}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
      {isBindThirdOpen ? (
        <BindPhoneMode
          open={isBindThirdOpen}
          setOpen={setIsBindThirdOpen}
          notifyFc={onClose}
          type={bindType}
        />
      ) : null}
    </Fragment>
  );
};

export default SettingsModal;
