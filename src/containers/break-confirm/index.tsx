/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-13 18:48:21
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\break-confirm\index.tsx
 */
import React, { Fragment } from "react";
import { Modal } from "antd";

import "./index.scss";

interface SettingsModalProps {
  accelOpen?: boolean;
  type: string;
  setAccelOpen?: (e: boolean) => void;
  onConfirm?: (e: any) => void;
}

const BreakConfirmModal: React.FC<SettingsModalProps> = (props) => {
  const {
    accelOpen,
    type,
    setAccelOpen = () => {},
    onConfirm = () => {},
  } = props;

  const textContentObj: any = {
    accelerate: "启动加速将断开现有游戏加速，是否确认？",
    stopAccelerate: "停止加速可能导致游戏重连，是否要继续？",
    loginOut: "确定退出当前账号登录吗？",
  };

  return (
    <Fragment>
      <Modal
        className="break-confirm"
        open={accelOpen}
        onCancel={() => setAccelOpen(false)}
        title="提示"
        centered
        maskClosable={false}
        footer={
          <div className="accelerate-modal-footer">
            <div className="footer-cancel" onClick={() => setAccelOpen(false)}>
              取消
            </div>
            <div className="footer-ok" onClick={onConfirm}>
              确定
            </div>
          </div>
        }
      >
        <div className="accelerate-modal">{textContentObj?.[type]}</div>
      </Modal>
    </Fragment>
  );
};

export default BreakConfirmModal;
