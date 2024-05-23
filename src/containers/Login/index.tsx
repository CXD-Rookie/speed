/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-23 15:06:28
 * @FilePath: \speed\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";

import Captcha from "./captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import clotureIcon from "@/assets/images/common/cloture.svg";
import loginLogocon from "@/assets/images/common/login-logo.svg";
import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";

declare const CefWebInstance: any;

export interface LoginProps {
  setIsLoginModal?: (value: any) => void;
  isLoginModal?: number;
}

const Login: React.FC<LoginProps> = (_props) => {
  const { setIsLoginModal = () => {}, isLoginModal = 0 } = _props;

  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [countdown, setCountdown] = useState(0);

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isShow, setIsShow] = useState(true);
  const [isPhone, setIsPhone] = useState(false);
  const [isVeryCode, setVeryCode] = useState(false);
  const [isVeryCodeErr, setVeryCodeErr] = useState(false);

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

        const loginMask = document.querySelector(".login-mask");

        if (loginMask) {
          loginMask.remove();
        }
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
    console.log(1111);
    const loginMask = document.querySelector(".login-mask");
    if (loginMask) {
      loginMask.remove();
    }
    setIsShow(false);
  };
  //   const pushData= async () => {
  //     var params = {
  //         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  //         "user_info": {
  //             "id": "6641ce2f1dca28a167f7e93f",
  //             "phone": "150****3252",
  //             "nickname": "幻想工程奇才",
  //             "avatar": "",
  //             "create_time": 1715588655
  //         }
  //     };
  //     CefWebInstance.call('jsCallPushClientInfo', params, (_AError: any, AResult: any) => {
  //         console.log('return jsCallStartSpeed');
  //         console.log(AResult);
  //     })
  // }

  return (
    <>
      {isShow && (
        <div className="login-modal">
          <div className="login-close" onClick={close}>
            <img src={clotureIcon} width={20} height={20} alt="" />
          </div>
          <div className="main">
            <div className="login-logo">
              <img
                src={
                  "https://jsq-web.oss-cn-beijing.aliyuncs.com/web/assets/login.png"
                }
                width={40}
                height={40}
                alt=""
              />
            </div>
            <div className="login-text">请登录</div>
            <div className="input-group public-input-group">
              <CustomInput
                placeholder={"请输入手机号码"}
                prefix={
                  <div className="custom-prefix-box">
                    <img src={phoneIcon} width={18} height={18} alt="" />
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
                  <img src={challengeIcon} width={18} height={18} alt="" />
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
                      `${countdown}s后获取`
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
      )}
    </>
  );
};

export default Login;
