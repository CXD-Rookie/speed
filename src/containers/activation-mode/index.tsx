/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-24 18:06:45
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\activation-mode\index.tsx
 */
import React, { useState } from "react";
import { Modal, Button, Select, Input } from "antd";

import "./index.scss";

const { Option } = Select;

interface ActivationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [terrace, seTerrace] = useState([
    {
      label: "Stema",
      value: "stema",
    },
  ]); // 平台列表
  const [trails, setTerrace] = useState("Select://asdfgdsa/12edsasdfc"); // 启动路径

  return (
    <Modal
      className="activation-modal"
      open={true} //isOpen
      onCancel={onClose}
      title="启动方式"
      width={400}
      centered
      footer={null}
    >
      <div className="activation-modal-content">
        <div className="content-title">启动平台：</div>
        <Select
          className="content-select"
          // defaultValue={selectedNode}
          // onChange={(value) => setSelectedNode(value)}
        >
          <Option value="stema">Stema</Option>
        </Select>
        <div className="content-title">启动路径：</div>
        <Input className="content-input" />
        <Button className="content-btn">保存</Button>
      </div>
    </Modal>
  );
};

export default ActivationModal;
