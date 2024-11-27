import React, { useState, useCallback, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import { setAccountInfo } from "../../redux/actions/account-info";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { debounce } from "@/common/utils";
import { setMinorState } from "@/redux/actions/modal-open";

import tracking from "@/common/tracking";
import Captcha from "./tencent-captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";
import webSocketService from "@/common/webSocketService";

import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";

import "./index.scss";

// 是否绑定加速器的手机号绑定登录
const VisitorLogin: React.FC= (props) => {
  const dispatch: any = useDispatch();
  const isBindPhone = useSelector((state: any) => state.auth.isBindPhone);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [countdown, setCountdown] = useState(0);

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isVeryCode, setVeryCode] = useState(false);
  const [isVeryCodeErr, setVeryCodeErr] = useState(false);
  
  // 使用 useCallback 包装 debounced 函数
  const debouncedChangeHandler = useCallback(
    debounce((value: any) => {
      let phoneNumberRegex = /^1[3456789]\d{9}$/; // 检查手机号格式是否正确

      setIsPhoneNumberValid(phoneNumberRegex.test(value));
    }, 300),
    []
  );

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    setPhoneNumber(value);
    debouncedChangeHandler(value);
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const handleLogin = async () => {
    if (!isPhoneNumberValid) {
      setIsPhone(true);
      return;
    } else {
      setIsPhone(false);
    }

    if (!verificationCode) {
      setVeryCodeErr(false);
      setVeryCode(true);
      return;
    }

    try {
      let res = await loginApi.updatePhone({
        phone: phoneNumber,
        verification_code: verificationCode,
      });

      if (res?.error === 0) {
        localStorage.setItem("token", JSON.stringify(res.data.token));
        // localStorage.setItem("is_new_user", JSON.stringify(res.data.is_new_user));
        // localStorage.setItem("vip_experience_time", JSON.stringify(res.data.vip_experience_time));
        
        const isNew = res.data.is_new_user;

        // 是新用户 上报注册成功，反之登录成功
        if (isNew) {
          tracking.trackSignUpSuccess("youXia");
        } else {
          tracking.trackLoginSuccess("youXia");
        }
        
        if (
          res.data.user_info.user_ext === null ||
          res.data.user_info.user_ext.idcard === ""
        ) {
          localStorage.setItem("isRealName", "1");
        } else {
          localStorage.setItem("isRealName", "0");
        }
        const types: any = {
          "1": "bind",
          "2": "remotethirdBind",
          "3": "remoteUpdateBind",
        };
        console.log(
          res?.data?.target_phone_status,
          String(res?.data?.target_phone_status || 1),
          types?.[String(res?.data?.target_phone_status || 1)]
        );

        dispatch(
          setMinorState({
            open: true,
            type: types?.[String(res?.data?.target_phone_status || 1)],
          })
        ); // 认证提示
        // 3个参数 用户信息 是否登录 是否显示登录
        dispatch(setAccountInfo(res.data.user_info, true, false));
        dispatch(updateBindPhoneState(false));
        localStorage.setItem("isRemote", "1"); // 标记11001是绑定手机时出现的
        webSocketService.updateTokenAndReconnect(res.data.token);
      } else {
        setVeryCode(false);
        setVeryCodeErr(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const close = async () => {
    dispatch(updateBindPhoneState(false));
    (window as any).loginOutStopWidow();
  };
  
  return (
    <Fragment>
      <Modal
        className="bind-visitor-login"
        open={isBindPhone}
        onCancel={close}
        title={null}
        width={"32vw"}
        centered
        destroyOnClose
        maskClosable={false}
        footer={null}
      >
        <div className="bind-main">
          <div className="login-text">游侠登录绑定手机号</div>
          <div className="bind-text">游侠登录绑定手机号</div>
          <div className="input-group public-input-group">
            <CustomInput
              placeholder={"请输入手机号码"}
              prefix={
                <div className="custom-prefix-box">
                  <img src={phoneIcon} alt="" />
                  <span>+86</span>
                </div>
              }
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
            {isPhone ? (
              <div className="ercode">手机号无效，请重新输入</div>
            ) : null}
          </div>
          <div className="computing-input-group public-input-group">
            <CustomInput
              placeholder={"请输入验证码"}
              countdown={countdown}
              prefix={
                <div className="custom-prefix-box">
                  <img src={challengeIcon} alt="" />
                </div>
              }
              suffix={
                <div
                  className={`old-verification-code ${
                    countdown > 0 &&
                    !isPhoneNumberValid &&
                    "send-verification-code"
                  }`}
                >
                  {countdown > 0 ? (
                    `${countdown}s后重新获取`
                  ) : !isPhoneNumberValid ? (
                    "获取验证码"
                  ) : (
                    <Captcha
                      phoneNumber={phoneNumber}
                      isPhoneNumberValid={isPhoneNumberValid}
                      setCountdown={setCountdown}
                    />
                  )}
                </div>
              }
              value={verificationCode}
              onChange={handleVerificationCodeChange}
            />
            {isVeryCode && <div className="ercode">请先获取验证码</div>}
            {isVeryCodeErr && (
              <div className="ercode">验证码错误，请重新输入</div>
            )}
          </div>
          <div className="login-btn-box">
            <button onClick={handleLogin}>提交</button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default VisitorLogin;
