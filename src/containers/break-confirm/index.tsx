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
import { useDispatch, useSelector } from "react-redux";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { openRealNameModal } from "@/redux/actions/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { setPayState } from "@/redux/actions/modal-open";

import webSocketService from "@/common/webSocketService";
import eventBus from "@/api/eventBus";
import tracking from "@/common/tracking";
import "./index.scss";

interface SettingsModalProps {
  accelOpen?: boolean;
  type?: string;
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
  const location = useLocation();
  const dispatch = useDispatch();

  const isPurchase = useSelector((state: any) => state.firstAuth)?.firstAuth
    ?.first_purchase; // 是否首充
  const { isNetworkError, setIsNetworkError }: any =
    useHistoryContext();
  const { removeGameList, identifyAccelerationData } = useGamesInitialize();

  const [noticeType, setNoticeType] = useState<any>(""); // 通过eventBus 传递的通知消息类型

  const [version, setVersion] = useState(""); // 立即升级版本
  const [feedbackClose, setfeedbackClose] = useState<any>(); // 问题反馈回调函数

  const [eventBusValue, setEventBusValue] = useState<any>({}); // eventBus调用携带的信息

  // 内容文案
  const textContentObj: any = {
    serverFailure: "服务器访问失败，请重新加速",
    accelerate: "启动加速将断开现有游戏加速，是否确认？",
    stopAccelerate: "停止加速可能导致游戏重连，是否要继续？",
    loginOut: identifyAccelerationData()?.[0]
      ? "退出登录将会中断正在加速的游戏，是否确认退出？"
      : "确定退出当前账号登录吗？",
    netorkError: "网络连接异常，请检查网络设置。",
    newVersionFound: "发现新版本",
    infectedOrHijacked: `配置项信息已损坏，点击"确定"尝试更新修复。`,
    accelerationServiceNotStarting:
      "无法启动加速服务，请重启客户端或使用问题反馈技术支持。",
    delayTooHigh:
      "网络延迟过高，可能影响游戏体验，请检查网络连接或尝试更换节点。",
    exit: identifyAccelerationData()?.[0]
      ? "退出加速器将会中断正在加速的游戏，是否确认退出？"
      : "确定要退出加速器吗？",
    renewalReminder: "您的加速服务即将到期，请尽快续费以享受流畅的游戏体验。",
    serverDisconnected: "无法连接到服务器，请重新启动客户端。",
    issueFeedback: "提交成功，感谢您的反馈！",
    issueFeedbackError: "提交失败，请重新尝试。",
    connectionPay:
      "当前有一笔订单正在支付处理中。如需切换支付方式或会员套餐，请等待该订单自动关闭（约20分钟）后再尝试提交新订单.",
    switchServer: "更换区服，可能导致游戏重新连接，建议先退出游戏",
    gamesAccelerating: "其他游戏正在加速！",
    takenShelves: "当前游戏已被下架，无法加速。",
    nodeDelete: "该节点已被删除，请选择其他节点",
    serviceExpired: "您的加速服务已到期，请续费继续使用。",
    servicerechargeReport:
      "加速服务异常，当前加速已停止，请检查网络后重试或使用问题反馈联系技术支持",
    infectedRepair: '进程目录信息丢失，点击"确定"尝试更新修复。',
    verificationFailed: '签名验证失败，点击"确定"尝试更新修复。',
    listeningIncorrect: '网络配置读取失败，点击"确定"尝试更新修复。',
    processCreationFailed: '加速进程创建失败，点击"确定"尝试更新修复。',
    systemResourcesInsufficient:
      "系统内存不足，无法启动加速服务，请关闭部分应用后重试。",
    driverFails: '驱动程序数字签名校验失败，点击"确定"尝试更新修复。',
    otherReasons: '加速服务启动失败，点击"确定"尝试更新修复。',
    runCaretakers:
      "加速服务启动失败，请检查防火墙或杀毒软件设置，确保加速器未被阻止。",
  };

  // footer 确认按钮的文案
  const confirmObj: any = {
    netorkError: "重试",
    newVersionFound: "立即升级",
    infectedOrHijacked: "确定",
    infectedRepair: "确定",
    verificationFailed: "确定",
    listeningIncorrect: "确定",
    otherReasons: "确定",
    systemResourcesInsufficient: "好的",
    driverFails: "确定",
    processCreationFailed: "确定",
    accelerationServiceNotStarting: "好的",
    runCaretakers: "好的",
    delayTooHigh: "更换节点",
    renewalReminder: "立即充值",
    serverDisconnected: "重启客户端",
    issueFeedback: "好的",
    issueFeedbackError: "好的",
    connectionPay: "继续支付",
    gamesAccelerating: "好的",
    takenShelves: "好的",
    nodeDelete: "好的",
    servicerechargeReport: "好的",
  };

  // footer 只显示一个按钮的类型
  const displaySingleButton = [
    "netorkError", // 断网
    "newVersionFound", // 更新版本
    "accelerationServiceNotStarting", // 无法启动加速服务
    "delayTooHigh", // 延迟过高
    "renewalReminder", // 会员快到期，续费提醒
    "serverDisconnected", // 服务器断开连接
    "issueFeedback", // 问题反馈
    "issueFeedbackError", // 问题反馈
    "connectionPay", //继续支付，订单未支付
    "gamesAccelerating",
    "takenShelves", // 游戏下架提示
    "nodeDelete", // 在节点历史记录中，当用户选择一个已被删除的节点
    "serviceExpired", // 加速校验是vip的时候
    "servicerechargeReport", // 客户端充值到期错误码 停止加速 提示到期 上报埋点
    "runCaretakers", // 客户端加速错误5的情况下的一种可能
    "systemResourcesInsufficient", // 客户端加速错误5的情况下的一种可能
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

  // 停止加速
  const stopAcceleration = (option: any = "initialize") => {
    if (!option?.is_accelerate && option !== "initialize") {
      removeGameList(option); // 更新我的游戏
      navigate("/home");
      return;
    }

    (window as any).stopProcessReset();
  };

  const cancel = () => {
    localStorage.removeItem("isAccelLoading");
    localStorage.removeItem("stopActive");
    
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
      case "serviceExpired":
        tracking.trackPurchasePageShow(
          isPurchase ? "boostFirst" : "boostExpiry"
        );
        cancel();
        dispatch(setPayState({ open: true, couponValue: {} })); // 会员充值页面
        break;
      case "loginOut":
        (window as any).loginOutStopWidow();
        break;
      case "exit":
        (window as any)?.stopProcessReset("exit"); // 关闭主程序
        break;
      case "renewalReminder":
        const isRealNamel = localStorage.getItem("isRealName"); // 实名认证信息
        
        // 是否打开实名认证校验
        if (process.env.REACT_APP_REALNAME === "1" && isRealNamel === "1") {
          dispatch(openRealNameModal());
          return;
        }

        tracking.trackPurchasePageShow(
          isPurchase ? "boostFirst" : "boostExpiry"
        );
        dispatch(setPayState({ open: true })); // 关闭会员充值页面
        break;
      case "netorkError":
        localStorage.removeItem("eventBuNetwork");
        webSocketService.scheduleHeartbeat();
        navigate(location.pathname);
        break;
      case "newVersionFound":
        stopAcceleration();
        (window as any).native_update();
        break;
      case "infectedOrHijacked": // 环境检查失败
      case "infectedRepair": // 进程所在目录查询失败 系统自动下载最新版本客户端并覆盖安装
      case "verificationFailed": // 签名验证失败
      case "listeningIncorrect": // 监听信息错误
      case "processCreationFailed": // 进程创建失败
      case "driverFails": // 监听端口创建失败 驱动数字签名校验不通过
      case "otherReasons": // 监听端口创建失败 其他原因
        stopAcceleration();
        (window as any).native_update();
        break;
      case "accelerationServiceNotStarting":
        stopAcceleration();
        break;
      case "serverDisconnected":
        (window as any).native_restart();
        break;
      case "issueFeedback":
      case "issueFeedbackError":
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
        break;
      default:
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showModal = (option: any = {}) => {
    setIsNetworkError(option?.show || true);
    setNoticeType(option?.type || "");

    if (option?.type === "netorkError") {
      setAccelOpen(false);
      localStorage.setItem("eventBuNetwork", "1");
    } else if (option?.type === "servicerechargeReport") {
      setAccelOpen(false);
    }

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
    </Fragment>
  );
};

export default BreakConfirmModal;
