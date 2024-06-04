/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-04 18:03:23
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState, useEffect } from "react";
import { Modal, Tabs, Button, Avatar, Switch, Radio } from "antd";
import { useDispatch } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

import "./index.scss";
import RealNameModal from "../real-name";
import PayModal from "../Pay";
const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("system");
  const [closeWindow, setCloseWindow] = useState<string>("2");

  const [userInfo, setUserInfo] = useState<any>({});
  const [isRealNameTag, setRealNameTag] = useState<any>("");
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  const token = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    let user_info = localStorage.getItem("userInfo");
    let close_sign = localStorage.getItem("close_window_sign") || "2";
    let isRealName = localStorage.getItem("isRealName");

    isRealName = isRealName ? isRealName : "";
    user_info = user_info ? JSON.parse(user_info) : {};

    setCloseWindow(close_sign);
    setUserInfo(user_info);
    setRealNameTag(isRealName);
  }, [isOpen]);

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
                  data-title="https://tc-js.yuwenlong.cn/terms_of_service.html"
                >
                  用户协议
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://tc-js.yuwenlong.cn/terms_of_service.html"
                >
                  隐私协议
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://tc-js.yuwenlong.cn/terms_of_service.html"
                >
                  儿童保护及监护人须知
                </span>
                <span
                  onClick={handleClick}
                  data-title="https://tc-js.yuwenlong.cn/automatic_renewal_agreement.html"
                >
                  自动续费协议
                </span>
              </div>
            </div>
          </TabPane>
          {token && (
            <TabPane tab="账户设置" key="account">
              <div className="tab-content">
                <div className="tab-avatar">
                  <Avatar
                    size={57}
                    src={
                      userInfo?.avatar ||
                      "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                    }
                  />
                  <div className="avatar-name">{userInfo.nickname}</div>
                </div>
                <div className="info-box">
                  <label>手机号:</label>
                  <div>{userInfo.phone}</div>
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
                    {userInfo.isVip ? (
                      <div>非会员</div>
                    ) : (
                      <div>{formatDate(userInfo.vip_expiration_time || 0)}</div>
                    )}
                  </div>
                  {userInfo.isVip ? (
                    <div
                      onClick={() => setIsModalOpenVip(true)}
                      className="real-name-btn"
                    >
                      充值
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsModalOpenVip(true)}
                      className="real-name-btn"
                    >
                      续费
                    </div>
                  )}
                </div>
                {!!isModalOpenVip && (
                  <PayModal
                    isModalOpen={isModalOpenVip}
                    setIsModalOpen={(e) => {
                      console.log(e);
                      setIsModalOpenVip(e);
                    }}
                  />
                )}
              </div>
            </TabPane>
          )}
        </Tabs>
      </Modal>
      <RealNameModal />
    </Fragment>
  );
};

export default SettingsModal;
