import React, { useState, useCallback, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { debounce, validateRequiredParams } from "@/common/utils";
import { setMinorState } from "@/redux/actions/modal-open";

import Captcha from "./tencent-captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";

import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";

import "./index.scss";

const errorObj: any = {
  quik: "您的操作频率太快，请稍后再试",
  error: "验证码错误，请重新输入",
};

// 是否绑定加速器的手机号绑定登录
const VisitorLogin: React.FC = (props) => {
  const dispatch: any = useDispatch();
  const isBindPhone = useSelector((state: any) => state.auth.isBindPhone);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [countdown, setCountdown] = useState(0);

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isVeryCode, setVeryCode] = useState(false);
  const [veryCodeErr, setVeryCodeErr] = useState("");

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
      setVeryCodeErr("error");
      setVeryCode(true);
      return;
    }

    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      let res = await loginApi.updatePhone({
        phone: phoneNumber,
        verification_code: verificationCode,
      });

      if (res?.error === 0) {
        localStorage.setItem("token", JSON.stringify(res.data.token));

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

        localStorage.setItem("userId", res?.data?.user_info?.id); // 存储user_id
        dispatch(updateBindPhoneState(false));
        localStorage.setItem("isRemote", "1"); // 标记11001是绑定手机时出现的

        dispatch(
          setMinorState({
            open: true,
            type: types?.[String(res?.data?.target_phone_status || 1)],
          })
        ); // 认证提示
      } else {
        setVeryCode(false);
        setVeryCodeErr("error");
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
                      setVeryCodeErr={setVeryCodeErr}
                    />
                  )}
                </div>
              }
              value={verificationCode}
              onChange={handleVerificationCodeChange}
            />
            {isVeryCode && <div className="ercode">请先获取验证码</div>}
            {veryCodeErr && (
              <div className="ercode">{errorObj?.[veryCodeErr]}</div>
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
