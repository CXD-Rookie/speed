/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-28 13:58:16
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\real-name\index.tsx
 */
import React, { useState } from "react";
import { Button, Input, Modal } from "antd";

import "./index.scss";

import realSucessIcon from "@/assets/images/common/real-sucess.svg";
import realErrorIcon from "@/assets/images/common/real_error.svg";

interface SettingsModalProps {
  isRealOpen: boolean;
  setIsRealOpen?: (value: boolean) => void;
}

const RealNameModal: React.FC<SettingsModalProps> = (props) => {
  const { isRealOpen, setIsRealOpen = () => {} } = props;

  const [realType, setRealType] = useState<any>(0); // 认证类型 假设 0 - 未填写 1 - 成功 2 - 加速时未成年 3 - 充值时未成年

  const onClose = () => {
    setIsRealOpen(false);
  };

  // 提交
  const handleSubmit = () => {
    try {
      console.log("提交");
      setRealType(3);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      className="real-name-modal"
      open={isRealOpen}
      onCancel={onClose}
      title="实名认证"
      width={676}
      centered
      footer={null}
    >
      {realType === 0 && (
        <div className="real-modal-content">
          <p className="modal-content-text">
            根据国家相关法律法规要求，网络平台服务需实名认证，为了不影响您的使用体验，请尽快完善信息。此信息仅用于验证，严格保证您的隐私安全。
          </p>
          <div className="modal-content-input-box">
            <div>姓名</div>
            <Input placeholder="请输入您的真实姓名" />
          </div>
          <div className="modal-content-input-box">
            <div>身份证号</div>
            <Input placeholder="请输入你的证件号" />
          </div>
          <Button className="modal-content-btn" onClick={handleSubmit}>
            立即提交
          </Button>
        </div>
      )}
      {realType === 1 && (
        <div className="real-sueccess-modal-content">
          <img src={realSucessIcon} width={69} height={69} alt="" />
          <p>恭喜，实名认证成功</p>
          <Button className="real-sueccess-btn" onClick={() => setRealType(0)}>
            好的
          </Button>
        </div>
      )}
      {(realType === 2 || realType === 3) && (
        <div className="real-sueccess-modal-content real-error-modal-content">
          <img src={realErrorIcon} width={69} height={69} alt="" />
          <p>
            抱歉，根据国家相关法律法规要求，暂不支持未成年人使用
            {realType === 2 && "加速"}
            {realType === 3 && "充值"}
            服务，感谢您的理解！
          </p>
          <Button className="real-sueccess-btn" onClick={() => setRealType(0)}>
            好的
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default RealNameModal;
