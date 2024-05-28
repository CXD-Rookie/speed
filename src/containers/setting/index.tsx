/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-24 16:37:01
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\setting\index.tsx
 */
import React, { Fragment, useState } from "react";
import { Modal, Tabs, Button, Avatar, Switch, Radio } from "antd";

import "./index.scss";
import RealNameModal from "../real-name";

const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("system");

  const [isAccreditation, setIsAccreditation] = useState(false); // 是否认证
  const [isRealOpen, setIsRealOpen] = useState(false); // 实名认证弹窗框

  return (
    <Fragment>
      <Modal
        className="system-setting"
        open={isOpen}
        onCancel={onClose}
        title="系统设置"
        width={676}
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
          <TabPane tab="账户设置" key="account">
            <div className="tab-content">
              <div className="tab-avatar">
                <Avatar size={57} src="path/to/avatar.jpg" />
                <div className="avatar-name">头像名称</div>
              </div>
              <div className="info-box">
                <label>手机号:</label>
                <div>159****2022</div>
              </div>
              <div className="info-box info-flex">
                <div className="info-left">
                  <label>实名认证</label>
                  <div>未认证</div>
                </div>
                {!isAccreditation && (
                  <Button type="primary" onClick={() => setIsRealOpen(true)}>
                    实名认证
                  </Button>
                )}
              </div>
              <div className="info-box info-flex">
                <div className="info-left">
                  <label>会员到期时间</label>
                  <div>非会员</div>
                </div>
                <Button type="primary">充值</Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
      <RealNameModal isRealOpen={isRealOpen} setIsRealOpen={setIsRealOpen} />
    </Fragment>
  );
};

export default SettingsModal;
