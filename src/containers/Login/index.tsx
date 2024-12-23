/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-16 17:56:18
 * @FilePath: \speed\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAccountInfo } from "../../redux/actions/account-info";
import { debounce } from "@/common/utils";
import webSocketService from "@/common/webSocketService";
import tracking from "@/common/tracking";
import Captcha from "./tencent-captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";
import "./index.scss";

import clotureIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.png";
import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";
import visitorLoginIcon from "@/assets/images/common/visitor-login.svg";
import { useNavigate } from "react-router-dom";

// 手机号对应错误码文案
const phoneErrorText: any = {
  1: "请输入手机号",
  2: "手机号无效，请重新输入",
};

// 验证码对应错误码文案
const codeErrorText: any = {
  1: "请先获取验证码",
  2: "验证码错误，请重新输入",
  3: "您的操作频率太快，请稍后再试",
};

const Login: React.FC = () => {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState(""); // 手机号
  const [verificationCode, setVerificationCode] = useState(""); // 验证码
  const [countdown, setCountdown] = useState(0); // 验证码时间

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false); // 是否输入了正确的手机号

  const [phoneError, setPhoneError] = useState<string>("0"); // 手机号错误状态码 "0" 正常状态
  const [codeError, setCodeError] = useState("0"); // 手机号验证码状态码 "0" 正常状态

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

  // 游侠登录 跳转浏览器
  const handlevisitorLogin = async (event: any) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_YouXiaAuth(dataTitle);
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const handleLogin = async () => {
    // 如果手机号校验不通过，验证码错误，进行错误提示
    if (!isPhoneNumberValid || !verificationCode) {
      !isPhoneNumberValid && setPhoneError("1");
      !verificationCode && setCodeError("1");
      return;
    }

    try {
      let res = await loginApi.phoneCodeLogin({
        phone: phoneNumber,
        verification_code: verificationCode,
        platform: 3,
      });

      if (res?.error === 0) {
        const isNew = res.data.is_new_user;
        const time = localStorage.getItem("firstActiveTime");
        const currentTime = Math.floor(Date.now() / 1000); // 当前时间
        const isTrue = time && currentTime < Number(time);

        // 是新用户 上报注册成功，反之登录成功
        if (isNew) {
          tracking.trackSignUpSuccess("phone", isTrue ? 1 : 0);
        } else {
          tracking.trackLoginSuccess("phone", isTrue ? 1 : 0);
        }

        localStorage.setItem("userId", res?.data?.user_info?.id); // 存储user_id
        localStorage.setItem("loginMethod", "phone");
        localStorage.setItem("token", JSON.stringify(res.data.token));
        localStorage.setItem("is_new_user", JSON.stringify(isNew));
        localStorage.setItem(
          "vip_experience_time",
          JSON.stringify(res.data.vip_experience_time)
        );
        localStorage.removeItem("isClosed");
        if (
          res.data.user_info.user_ext === null ||
          res.data.user_info.user_ext.idcard === ""
        ) {
          localStorage.setItem("isRealName", "1");
        } else {
          localStorage.setItem("isRealName", "0");
        }

        const loginModal = document.querySelector(
          ".login-modal"
        ) as HTMLElement | null;

        if (loginModal) {
          loginModal.style.display = "none";
        }

        // 3个参数 用户信息 是否登录 是否显示登录
        webSocketService.loginReconnect();
        dispatch(setAccountInfo(res.data.user_info, true, false));

        navigate("/home");
      } else {
        setCodeError("2")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const close = async () => {
    dispatch(setAccountInfo(undefined, undefined, false));
  };

  return (
    <div className="login-modal">
      <div className="login-close" onClick={close}>
        <img src={clotureIcon} width={20} height={20} alt="" />
      </div>
      <div className="main">
        <div className="login-logo">
          <img src={logoIcon} alt="" />
        </div>
        <div className="login-text">请登录</div>
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
          <div className="ercode">{phoneErrorText?.[phoneError || "0"]}</div>
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
                  <div onClick={() => setPhoneError(phoneNumber ? "2" : "1")}>
                    获取验证码
                  </div>
                ) : (
                  <Captcha
                    phoneNumber={phoneNumber}
                    isPhoneNumberValid={isPhoneNumberValid}
                    setCountdown={setCountdown}
                    onResetErrors={() => setPhoneError("0")}
                    onSendErrors={(type, state) =>
                      type === "code"
                        ? setCodeError(state as string)
                        : setPhoneError(state as string)
                    }
                  />
                )}
              </div>
            }
            value={verificationCode}
            onChange={handleVerificationCodeChange}
          />
          {<div className="ercode">{codeErrorText?.[codeError || "0"]}</div>}
        </div>
        <div className="login-btn-box">
          <button onClick={handleLogin}>登录</button>
        </div>
        <div
          className="visitor-login-text"
          onClick={handlevisitorLogin}
          data-title={`https://i.ali213.net/oauth.html?appid=yxjsqaccelerator&redirect_uri=${process.env.REACT_APP_YOUXIA_URL}&response_type=code&scope=webapi_login&state=state`}
        >
          <img src={visitorLoginIcon} alt="" />
          游侠登录
        </div>
      </div>
    </div>
  );
};

export default Login;
