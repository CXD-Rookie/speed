/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-12 14:58:59
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\minor\index.tsx
 */
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { closeRealNameModal } from "@/redux/actions/auth";
import { useNavigate } from "react-router-dom";
import { setAccountInfo } from "../../redux/actions/account-info";
import {
  setBindState,
  setFirstPayRP,
  setDrawVipActive,
  setAppCloseOpen,
  setNewUserOpen,
  setFeedbackPopup,
  setStartPathOpen,
  setCurrencyOpen,
  setSetting,
  setPayState,
  setMinorState,
} from "@/redux/actions/modal-open";
import "./index.scss";
import tracking from "@/common/tracking";

import realErrorIcon from "@/assets/images/common/real_error_quan.svg";
import realSucessIcon from "@/assets/images/common/real-sucess.svg";
import exclErrorIcon from "@/assets/images/common/excl.svg";

const sucessStateMap = [1, 4, 5, 6, 7, 8];
const errorStateMap = [2, 3, 9, 10, 11];
const largeMap = [
  "acceleration",
  "recharge",
  "remoteUpdateBind",
  "remotethirdBind",
];

const MinorModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const { open = false, type = "" } = useSelector(
    (state: any) => state?.modalOpen?.minorState
  );

  // 认证类型 2 - 加速时未成年 3 - 充值时未成年 1 - 认证成功
  const [realType, setRealType] = useState<any>();

  const sign_expires = useSelector((state: any) => state.auth.sign_expires);

  const handleClose = () => {
    dispatch(closeRealNameModal()); // 关闭实名认证
    dispatch(setMinorState({ open: false, type: "" })); // 关闭实名认证提示

    if (["updatePhone", "unbind"].includes(type)) {
      dispatch(setBindState({ open: false, type: "" })); // 关闭绑定类型弹窗
      dispatch(setSetting({ settingOpen: false, type: "default" })); // 关闭设置
    }

    // 异地登录确定时
    if (realType === 9) {
      dispatch(setBindState({ open: false, type: "" })); // 第三方手机绑定类型弹窗
      dispatch(setPayState({ open: false, couponValue: {} })); // 支付弹窗
      dispatch(setFirstPayRP({ open: false, type: "" })); // 首次支付弹窗
      dispatch(setDrawVipActive({ open: false, value: {} })); // 领取会员有效期弹窗
      dispatch(setAppCloseOpen(false)); // app关闭窗口设置提醒
      dispatch(setNewUserOpen(false)); // 新用户弹窗
      dispatch(setFeedbackPopup({ open: false, defaultInfo: "" })); // 问题反馈
      dispatch(setStartPathOpen(false)); // 启动路径开关
      dispatch(setCurrencyOpen(false)); // 口令兑换开关
      dispatch(setSetting({ settingOpen: false, type: "default" })); // 设置开关传递信息
      dispatch(setAccountInfo(undefined, undefined, true)); // 用户信息
    }

    if ([10, 11].includes(realType)) {
      navigate("/home");
      // 3个参数 用户信息 是否登录 是否显示登录
      dispatch(setAccountInfo(undefined, false, true));
    }

    // 标记实名认证操作，当提醒加速服务即将到期，并且实名后使用此标记做判断
    if (sign_expires) {
      tracking.trackPurchasePageShow("boostExpiry");
      dispatch(setPayState({ open: true, couponValue: {} })); // 关闭会员充值页面
    }
  };

  useEffect(() => {
    let typeObj: any = {
      success: 1, // 未成年实名认证成功
      acceleration: 2, // 未成年加速
      recharge: 3, // 未成年充值
      bind: 4, // 注册并绑定
      updatePhone: 5, // 正常换绑
      unbind: 6, // 解绑
      thirdBind: 7, // 第三方绑定
      thirdUpdateBind: 8, // 第三方换绑
      remoteLogin: 9, // 异地登录
      remoteUpdateBind: 10, // 换绑第三方并且可能返回11001
      remotethirdBind: 11, // 绑定第三方并且可能返回11001
    };

    if (typeObj?.[type]) {
      setRealType(typeObj?.[type]);
    }
  }, [type]);
  
  return open ? (
    <Fragment>
      <Modal
        className={`real-name-minor-modal ${
          largeMap.includes(type)
            ? "real-name-minor-modal-first"
            : "real-name-minor-modal-second"
        }`}
        open={open}
        destroyOnClose
        title="提示"
        width={"32vw"}
        centered
        maskClosable={false}
        footer={null}
        onCancel={() => handleClose()}
      >
        {errorStateMap.includes(realType) && (
          <div className="real-error-modal-content">
            <img
              src={realType === 9 ? exclErrorIcon : realErrorIcon}
              width={69}
              height={69}
              alt=""
            />
            {[2, 3].includes(realType) && (
              <p>
                抱歉，根据国家相关法律法规要求，暂不支持未成年人使用
                {realType === 2 && "加速"}
                {realType === 3 && "充值"}
                服务，感谢您的理解！
              </p>
            )}
            {realType === 9 && <p>您的登录已失效，请重新登录。</p>}
            {realType === 11 && (
              <p>您的手机号已成功绑定至账户，请在点击确认后重新登录。</p>
            )}
            <Button className="real-sueccess-btn" onClick={() => handleClose()}>
              好的
            </Button>
          </div>
        )}
        {sucessStateMap.includes(realType) && (
          <div className="real-sueccess-modal-content">
            <img src={realSucessIcon} width={69} height={69} alt="" />
            <p>
              {realType === 1 && "恭喜，实名认证成功"}
              {realType === 4 && "您的手机号已成功绑定并注册至账户"}
              {realType === 5 && "恭喜，手机更换成功"}
            </p>
            <Button className="real-sueccess-btn" onClick={handleClose}>
              好的
            </Button>
          </div>
        )}
      </Modal>
    </Fragment>
  ) : null;
};

export default MinorModal;
