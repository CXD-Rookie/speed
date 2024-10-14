/*
 * @Author: zhangda
 * @Date: 2024-05-28 20:11:13
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-10 16:55:06
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\break-confirm\index.tsx
 */
import React, { Fragment, useEffect, useState } from "react";
import { Modal } from "antd";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useNavigate } from "react-router-dom";
import tracking from "@/common/tracking";
import eventBus from "@/api/eventBus";

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

  const [noticeType, setNoticeType] = useState<any>(""); // 通过eventBus 传递的通知消息类型
  const [settingOpen, setSettingOpen] = useState(false);

  const [version, setVersion] = useState(""); // 立即升级版本
  const [feedbackClose, setfeedbackClose] = useState<any>(); // 问题反馈回调函数

  const [eventBusValue, setEventBusValue] = useState<any>({}); // eventBus调用携带的信息

  // 内容文案
  const textContentObj: any = {
    accelerate: "启动加速将断开现有游戏加速，是否确认？",
    stopAccelerate: "停止加速可能导致游戏重连，是否要继续？",
    loginOut: identifyAccelerationData()?.[0]
      ? "退出登录将会中断正在加速的游戏，是否确认退出？"
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
    accelMemEnd: "您的加速服务已到期，请续费继续使用",
    serverDisconnected: "无法连接到服务器，请重新启动客户端。",
    issueFeedback: "提交成功，感谢您的反馈！",
    connectionPay:
      "当前有一笔订单正在支付处理中。如需切换支付方式或会员套餐，请等待该订单自动关闭（约20分钟）后再尝试提交新订单.",
    switchServer: "更换区服，可能导致游戏重新连接，建议先退出游戏",
    gamesAccelerating: "其他游戏正在加速！",
    takenShelves: "当前游戏已被下架，无法加速。",
  };

  // footer 确认按钮的文案
  const confirmObj: any = {
    netorkError: "重启加速器",
    newVersionFound: "立即升级",
    infectedOrHijacked: "修复",
    accelerationServiceNotStarting: "好的",
    delayTooHigh: "更换节点",
    renewalReminder: "立即充值",
    accelMemEnd: "好的",
    serverDisconnected: "重启客户端",
    issueFeedback: "好的",
    connectionPay: "继续支付",
    gamesAccelerating: "好的",
    takenShelves: "好的",
  };

  // footer 只显示一个按钮的类型
  const displaySingleButton = [
    "netorkError", // 断网
    "newVersionFound", // 更新版本
    "accelerationServiceNotStarting", // 无法启动加速服务
    "delayTooHigh", // 延迟过高
    "renewalReminder", // 会员快到期，续费提醒
    "accelMemEnd", // 加速中并且会员到期 停止加速
    "serverDisconnected", // 服务器断开连接
    "issueFeedback", // 问题反馈
    "connectionPay", //继续支付，订单未支付
    "gamesAccelerating",
    "takenShelves", // 游戏下架提示
  ];

  // 不显示右上角关闭的类型
  const hideClosedCategories = [
    "newVersionFound",
    "serverDisconnected",
    "issueFeedback",
    "netorkError",
    "connectionPay",
    "takenShelves",
  ];

  // 修改样式类型
  const customStyleObj: any = {
    newVersionFound: { marginTop: 0 },
    connectionPay: { marginTop: "1vh" },
  };

  let jsonString = "";

  const userToken = localStorage.getItem("token");
  const jsKey = localStorage.getItem("StartKey");

  // 停止加速
  const stopAcceleration = (option: any = "initialize") => {
    if (jsKey) {
      jsonString = JSON.stringify({
        params: {
          user_token: userToken ? JSON.parse(userToken) : "",
          js_key: jsKey,
        },
      });
    }
    (window as any).NativeApi_AsynchronousRequest(
      "NativeApi_StopProxy",
      jsonString,
      function (response: any) {
        if (!response) {
          console.warn("No response received from 停止加速没有成功");
          return;
        }
        console.log("Success response from 停止加速:", response);
        tracking.trackBoostDisconnectManual("手动停止加速");
        removeGameList(option); // 更新我的游戏
        accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        navigate("/home");
      }
    );
  };

  const cancel = () => {
    localStorage.removeItem("isAccelLoading");
    
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
        (window as any).native_restart();
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
      case "serverDisconnected":
        (window as any).native_restart();
        break;
      case "issueFeedback":
        feedbackClose.onClose();
        break;
      case "accelerate":
        localStorage.removeItem("isAccelLoading");
        break;
      case "takenShelves":
        if (eventBusValue?.onOk) {
          eventBusValue?.onOk();
        }
        
        stopAcceleration(eventBusValue?.value);
        navigate("/home")
        break;
      default:
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showModal = (option: any = {}) => {
    setIsNetworkError(option?.show || true);
    setNoticeType(option?.type || "");

    if (option?.type === "newVersionFound") {
      setVersion(option?.version);
    } else if (option?.type === "issueFeedback") {
      setfeedbackClose({ onClose: option?.onClose });
    } else if (option?.type === "takenShelves") {
      setEventBusValue(option);
    }
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
        closable={
          hideClosedCategories.includes(isNetworkError ? noticeType : type)
            ? false
            : true
        }
        width={"32vw"}
        onCancel={cancel}
        title="提示"
        centered
        maskClosable={false}
        footer={null}
      >
        <div className="content">
          <div
            className="accelerate-modal"
            style={{
              ...(customStyleObj?.[noticeType || type] || { marginTop: "3vh" }),
            }}
          >
            {isNetworkError
              ? textContentObj?.[noticeType]
              : textContentObj?.[type]}
          </div>
          {noticeType === "newVersionFound" && (
            <div className="version">V {version}</div>
          )}
          <div className="accelerate-modal-footer">
            {!displaySingleButton.includes(
              isNetworkError ? noticeType : type
            ) && (
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
              {confirmObj?.[isNetworkError ? noticeType : type] || "确定"}
            </div>
          </div>
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
