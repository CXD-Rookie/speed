/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-06 18:50:29
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\stop-confirm\index.tsx
 */
import React, { Fragment } from "react";
import { Modal } from "antd";

import "./index.scss";

interface SettingsModalProps {
  accelOpen?: boolean;
  setAccelOpen?: (e: boolean) => void;
  onConfirm?: (e: any) => void;
}

const StopConfirmModal: React.FC<SettingsModalProps> = (props) => {
  const { accelOpen, setAccelOpen = () => {}, onConfirm = () => {} } = props;

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
        <div className="accelerate-modal">
          停止加速可能导致游戏重连，是否要继续？
        </div>
      </Modal>
    </Fragment>
  );
};

export default StopConfirmModal;
