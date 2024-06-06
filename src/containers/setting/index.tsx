/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-06 10:18:25
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState, useEffect } from "react";
import { Modal, Tabs, Button, Switch, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

import "./index.scss";
import UserAvatarCom from "../login-user/user-avatar";
import RealNameModal from "../real-name";
import PayModal from "../Pay";

const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  type?: string;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose, type = "default" } = props;

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const [activeTab, setActiveTab] = useState("system");
  const [closeWindow, setCloseWindow] = useState<string>("2");

  const [isRealNameTag, setRealNameTag] = useState<any>("");
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

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

  useEffect(() => {
    let close_sign = localStorage.getItem("close_window_sign") || "2";
    let isRealName = localStorage.getItem("isRealName");

    isRealName = isRealName ? isRealName : "";

    setCloseWindow(close_sign);
    setRealNameTag(isRealName);
  }, [isOpen, isModalOpenVip]);

  useEffect(() => {
    console.log(type);

    if (type === "edit") {
      setActiveTab("account");
    }
  }, [type]);

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
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="系统设置" key="system">
            <div className="tab-content">
              <div className="setting-item">
                <div className="item-title">常用设置</div>
                <div className="item-content">
                  <span>
                    开机自动启动
                    <Switch defaultChecked />
                  </span>
                  <span>
                    桌面快捷图标
                    <Switch defaultChecked />
                  </span>
                </div>
              </div>
              <div className="setting-item">
                <div className="item-title">关闭窗口时</div>
                <div className="off-item-content">
                  <Radio.Group
                    onChange={(e) => {
                      let value = e.target.value;

                      setCloseWindow(value);
                      localStorage.setItem("close_window_sign", value);
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
                  版本号: 1.0.110<Button type="default">检查新版本</Button>
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
                  data-title="https://cdn.accessorx.com/web/terms_of_service.html"
                >
                  隐私协议
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://cdn.accessorx.com/web/terms_of_service.html"
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
            <TabPane tab="账户设置" key="account">
              <div className="tab-content">
                <div className="tab-avatar">
                  <UserAvatarCom
                    isVip={accountInfo?.userInfo?.is_vip}
                    isLogin={accountInfo?.isLogin}
                    type={"setting"}
                  />
                  <div className="avatar-name">
                    {accountInfo?.userInfo.nickname}
                  </div>
                </div>
                <div className="info-box">
                  <label>手机号:</label>
                  <div>{accountInfo?.userInfo.phone}</div>
                </div>
                <div className="info-box info-flex">
                  <div className="info-left">
                    <label>实名认证</label>
                    {isRealNameTag === 1 ? (
                      <div>未认证</div>
                    ) : (
                      <div>已认证</div>
                    )}
                  </div>
                  {isRealNameTag == 1 && (
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
                    {accountInfo?.userInfo.is_vip ? (
                      <div>
                        {formatDate(
                          accountInfo?.userInfo.vip_expiration_time || 0
                        )}
                      </div>
                    ) : (
                      <div>非会员</div>
                    )}
                  </div>
                  {accountInfo?.userInfo.is_vip ? (
                    <div
                      onClick={() => {
                        const isRealNamel = localStorage.getItem("isRealName");

                        if (isRealNamel === "1") {
                          dispatch(openRealNameModal());
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
                      onClick={() => setIsModalOpenVip(true)}
                      className="real-name-btn"
                    >
                      充值
                    </div>
                  )}
                </div>
              </div>
            </TabPane>
          )}
        </Tabs>
      </Modal>
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      <RealNameModal />
    </Fragment>
  );
};

export default SettingsModal;
