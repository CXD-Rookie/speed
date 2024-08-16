/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-06 19:40:38
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\pay-error\index.tsx
 */
import React, { Fragment } from "react";
import { Modal } from "antd";

import "./index.scss";
// import realErrorIcon from "@/assets/images/common/real_error.svg";
import realErrorQuan from "@/assets/images/common/real_error_quan.svg";

interface SettingsModalProps {
  accelOpen?: boolean;
  setAccelOpen?: (e: boolean) => void;
  onConfirm?: (e: any) => void;
}

const PayErrorModal: React.FC<SettingsModalProps> = (props) => {
  const { accelOpen, setAccelOpen = () => {}, onConfirm = () => {} } = props;

  return (
    <Fragment>
      <Modal
        className="pay-error-module"
        open={accelOpen}
        onCancel={() => setAccelOpen(false)}
        title="提示"
        centered
        maskClosable={false}
        footer={
          <div className="footer-cancel" onClick={() => onConfirm(false)}>
            确认
          </div>
        }
      >
        <img className="real-error-icon" src={realErrorQuan} alt="" />
        <div className="box" />
        <div className="accelerate-modal">很抱歉，您的支付未成功</div>
        <div className="accelerate-modal">
          请检查网络连接或更换支付方式后在试一次。
        </div>
        <div className="accelerate-modal">如有疑问，请联系客服</div>
      </Modal>
    </Fragment>
  );
};

export default PayErrorModal;
