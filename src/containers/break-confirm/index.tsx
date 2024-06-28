/*
 * @Author: zhangda
 * @Date: 2024-05-28 20:11:13
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-28 10:48:06
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\break-confirm\index.tsx
 */
import React, { Fragment, useEffect, useState } from "react";
import { Modal } from "antd";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useNavigate } from "react-router-dom";

import eventBus from "@/api/eventBus";
import useCefQuery from "@/hooks/useCefQuery";
import playSuitApi from "@/api/speed";

import "./index.scss";
import SettingsModal from "../setting";

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

  const navigate = useNavigate();

  const { isNetworkError, setIsNetworkError, accelerateTime }: any =
    useHistoryContext();
  const { removeGameList, identifyAccelerationData } = useGamesInitialize();
  const sendMessageToBackend = useCefQuery();

  const [noticeType, setNoticeType] = useState<any>(""); // 通过eventBus 传递的通知消息类型
  const [settingOpen, setSettingOpen] = useState(false);

  const textContentObj: any = {
    accelerate: "启动加速将断开现有游戏加速，是否确认？",
    stopAccelerate: "停止加速可能导致游戏重连，是否要继续？",
    loginOut: identifyAccelerationData()?.[0]
      ? "退出登录将会中断正在加速的游戏"
      : "确定退出当前账号登录吗？",
    netorkError: "网络连接异常，请检查网络设置。",
    newVersionFound: "发现新版本",
    infectedOrHijacked: "检测到加速器安全问题，请立即进行安全自我修复",
    accelerationServiceNotStarting:
      "无法启动加速服务，请重启客户端或使用问题反馈技术支持。",
    delayTooHigh:
      "网络延迟过高，可能影响游戏体验，请检查网络连接或尝试更换节点。",
    exit: identifyAccelerationData()?.[0]
      ? "退出加速器将会中断正在加速的游戏，是否确认退出？"
      : "确定要退出加速器吗？",
    renewalReminder: "您的加速服务即将到期，请尽快续费以享受流畅的游戏体验。",
  };

  const confirmObj: any = {
    netorkError: "好的",
    newVersionFound: "立即升级",
    infectedOrHijacked: "修复",
    accelerationServiceNotStarting: "好的",
    delayTooHigh: "更换节点",
    renewalReminder: "立即充值",
  };

  const displaySingleButton = [
    "netorkError",
    "newVersionFound",
    "accelerationServiceNotStarting",
    "delayTooHigh",
    "renewalReminder",
  ];

  // 停止加速
  const stopAcceleration = () => {
    playSuitApi.playSpeedEnd({
      platform: 3,
      js_key: localStorage.getItem("StartKey"),
    }); // 游戏停止加速
    // 停止加速
    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        removeGameList("initialize"); // 更新我的游戏
        accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        navigate("/home");
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );
  };

  const cancel = () => {
    if (accelOpen) {
      setAccelOpen(false);
    } else {
      setNoticeType("");
      setIsNetworkError(false);
    }
  };

  const performOperationBasedOnType = () => {
    setNoticeType("");
    setIsNetworkError(false);

    switch (noticeType) {
      case "netorkError":
        stopAcceleration();
        break;
      case "newVersionFound":
        (window as any).native_update();
        stopAcceleration();
        break;
      case "infectedOrHijacked":
        setSettingOpen(true);
        stopAcceleration();
        break;
      case "accelerationServiceNotStarting":
        stopAcceleration();
        break;
      default:
        break;
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
                  performOperationBasedOnType();
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
      {settingOpen ? (
        <SettingsModal
          type="fix"
          isOpen={settingOpen}
          onClose={() => setSettingOpen(false)}
        />
      ) : null}
    </Fragment>
  );
};

export default BreakConfirmModal;
