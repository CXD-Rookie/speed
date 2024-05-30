/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-30 15:36:36
 * @FilePath: \speed\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setIsLogin } from "../../redux/actions/auth";

import Captcha from "./captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";
import "./index.scss";

import clotureIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.svg";
import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";

declare const CefWebInstance: any;

export interface LoginProps {
  setIsLoginModal?: (value: any) => void;
  isLoginModal?: number;
  // setIsLogin?: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = (_props) => {
  const {
    setIsLoginModal = () => {},
    isLoginModal = 0,
    // setIsLogin = () => {},
  } = _props;

  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [countdown, setCountdown] = useState(0);

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isVeryCode, setVeryCode] = useState(false);
  const [isVeryCodeErr, setVeryCodeErr] = useState(false);

  const dispatch = useDispatch();
  const isLogin = useSelector((state: any) => state.auth.isLogin);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // 检查手机号格式是否正确
    const phoneNumberRegex = /^1[3456789]\d{9}$/;
    setIsPhoneNumberValid(phoneNumberRegex.test(value));

    setPhoneNumber(value);
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
    }

    if (!verificationCode) {
      setVeryCodeErr(false);
      setVeryCode(true);
      return;
    }

    try {
      let res = await loginApi.phoneCodeLogin({
        phone: phoneNumber,
        verification_code: verificationCode,
        platform: 1,
      });

      if (res?.error === 0) {
        console.log(res.data, "111111111111111");
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        localStorage.setItem("token", JSON.stringify(res.data.token));
        localStorage.setItem("isLogin", "true");

        // 处理登录逻辑
        setIsLoginModal(isLoginModal + 1);

        const loginModal = document.querySelector(
          ".login-modal"
        ) as HTMLElement | null;
        if (loginModal) {
          loginModal.style.display = "none";
        }

        // navigate("/home")

        //   CefWebInstance.call('jsCallPushClientInfo', res.data, (_AError: any, AResult: any) => {
        //     console.log('return jsCallStartSpeed');
        //     console.log(AResult);
        // })
      } else {
        console.log(res, "111111111");
        setVeryCode(false);
        setVeryCodeErr(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const close = async () => {
    dispatch(setIsLogin(false));
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
          {isPhone && <div className="ercode">请输入正确的手机号码</div>}
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
                  "发送验证码"
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
          {isVeryCode && <div className="ercode">请输入正确的验证码</div>}
          {isVeryCodeErr && (
            <div className="ercode">对不起，验证码错误，请重新输入</div>
          )}
        </div>
        <div className="login-btn-box">
          <button onClick={handleLogin}>登录</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
