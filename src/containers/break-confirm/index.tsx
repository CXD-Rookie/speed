/*
 * @Author: zhangda
 * @Date: 2024-05-28 20:11:13
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-27 18:26:16
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\break-confirm\index.tsx
 */
import React, { Fragment, useEffect, useState } from "react";
import { Modal } from "antd";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import eventBus from "@/api/eventBus";

import "./index.scss";

interface SettingsModalProps {
  accelOpen?: boolean;
  type: string;
  setAccelOpen?: (e: boolean) => void;
  onConfirm?: () => void;
}

const BreakConfirmModal: React.FC<SettingsModalProps> = (props) => {
  const {
    accelOpen,
    type = "",
    setAccelOpen = () => {},
    onConfirm = () => {},
  } = props;

  const { isNetworkError, setIsNetworkError }: any = useHistoryContext();

  const [noticeType, setNoticeType] = useState<any>("");

  const textContentObj: any = {
    accelerate: "启动加速将断开现有游戏加速，是否确认？",
    stopAccelerate: "停止加速可能导致游戏重连，是否要继续？",
    loginOut: "确定退出当前账号登录吗？",
    netorkError: "网络连接异常，请检查网络设置。",
    newVersionFound: "发现新版本",
  };

  const confirmObj: any = {
    netorkError: "好的",
    newVersionFound: "立即升级",
  };

  const displaySingleButton = ["netorkError", "newVersionFound"];

  const cancel = () => {
    if (accelOpen) {
      setAccelOpen(false);
    } else {
      setNoticeType("");
      setIsNetworkError(false);
    }
  };

  const showModal = (option: any = {}) => {
    setIsNetworkError(option?.show || true);
    setNoticeType(option?.type || "");
  };

  useEffect(() => {
    eventBus.on("showModal", showModal);

    return () => {
      eventBus.off("showModal", showModal);
    };
  }, [showModal]);

  return (
    <Fragment>
      <Modal
        className="break-confirm"
        open={accelOpen || isNetworkError}
        onCancel={cancel}
        title="提示"
        centered
        maskClosable={false}
        footer={
          <div className="accelerate-modal-footer">
            {!displaySingleButton.includes(noticeType) && (
              <div className="footer-cancel" onClick={cancel}>
                取消
              </div>
            )}
            <div
              className="footer-ok"
              onClick={() => {
                if (accelOpen) {
                  onConfirm();
                } else {
                  switch (noticeType) {
                    case "newVersionFound":
                      (window as any).native_update();
                      break;
                    default:
                      setNoticeType("");
                      setIsNetworkError(false);
                      break;
                  }
                }
              }}
            >
              {confirmObj?.[noticeType] || "确定"}
            </div>
          </div>
        }
      >
        <div className="accelerate-modal">
          {isNetworkError
            ? textContentObj?.[noticeType]
            : textContentObj?.[type]}
        </div>
      </Modal>
    </Fragment>
  );
};

export default BreakConfirmModal;
