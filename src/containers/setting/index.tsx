/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-31 19:05:04
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState, useEffect } from "react";
import { Modal, Tabs, Button, Avatar, Switch, Radio } from "antd";

import "./index.scss";
import RealNameModal from "../real-name";
import { useDispatch } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("system");
  const [userInfo, setUserInfo] = useState<any>({});
  const [isRealNameTag, setRealNameTag] = useState<any>("");

  const token = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    let user_info = localStorage.getItem("userInfo");
    let isRealName = localStorage.getItem("isRealName");
    isRealName = isRealName ? isRealName : "";
    user_info = user_info ? JSON.parse(user_info) : {};
    setUserInfo(user_info);
    setRealNameTag(isRealName);
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <Fragment>
      <Modal
        className="system-setting"
        open={isOpen}
        onCancel={onClose}
        title="系统设置"
        width={"67.6vw"}
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
                  <Radio.Group>
                    <Radio value={1}>隐藏任务到托盘</Radio>
                    <Radio value={2}>关闭程序</Radio>
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
                <span>用户协议</span>
                <span>隐私协议</span>
                <span>儿童保护及监护人须知</span>
                <span>自动续费协议</span>
              </div>
            </div>
          </TabPane>
          {token && (
            <TabPane tab="账户设置" key="account">
              <div className="tab-content">
                <div className="tab-avatar">
                  <Avatar size={57} src="path/to/avatar.jpg" />
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
                      <div>已实名认证通过</div>
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
                      <div>{formatDate(userInfo.vip_expiration_time)}</div>
                    )}
                  </div>
                  {userInfo.isVip ? (
                    <div className="real-name-btn">充值</div>
                  ) : (
                    <div className="real-name-btn">续费</div>
                  )}
                </div>
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
