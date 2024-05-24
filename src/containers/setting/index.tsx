import React, { useState } from 'react';
import { Modal, Tabs, Checkbox, Button, Avatar } from 'antd';
import './index.scss';

const { TabPane } = Tabs;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <Modal
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      bodyStyle={{ padding: 0 }}
      centered
      closeIcon={<span style={{ fontSize: 24 }}>×</span>}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ display: 'flex', justifyContent: 'center' }}
      >
        <TabPane tab="系统设置" key="system">
          <div className="tab-content">
            <div className="setting-item">
              <label>网络优化加速</label>
              <Checkbox />
            </div>
            <div className="setting-item">
              <label>显卡优化加速</label>
              <Checkbox />
            </div>
            <div className="setting-item">
              <label>显示FPS</label>
              <Checkbox />
            </div>
            <div className="setting-item">
              <label>版本号: 1.0.110</label>
              <Button type="primary">检查新版本</Button>
            </div>
          </div>
        </TabPane>
        <TabPane tab="账户设置" key="account">
          <div className="tab-content">
            <div className="setting-item">
              <label>手机号:</label>
              <span>159****2022</span>
              <Button type="primary">更改认证</Button>
            </div>
            <div className="setting-item">
              <label>头像</label>
              <div className="avatar">
                <Avatar size={64} src="path/to/avatar.jpg" />
                <Button type="primary">更换</Button>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default SettingsModal;
