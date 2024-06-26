/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-26 11:07:03
 * @FilePath: \speed\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAccountInfo } from "../../redux/actions/account-info";
import { updateBindPhoneState } from "@/redux/actions/auth";
import { debounce } from "@/common/utils";

import Captcha from "./tencent-captcha";
import CustomInput from "./custom-input";
import loginApi from "@/api/login";
import "./index.scss";

import clotureIcon from "@/assets/images/common/cloture.svg";
import logoIcon from "@/assets/images/common/logo.svg";
import phoneIcon from "@/assets/images/common/phone.svg";
import challengeIcon from "@/assets/images/common/challenge.svg";
import visitorLoginIcon from "@/assets/images/common/visitor-login.svg";

declare const CefWebInstance: any;

const Login: React.FC = () => {
  const dispatch: any = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [countdown, setCountdown] = useState(0);

  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isVeryCode, setVeryCode] = useState(false);
  const [isVeryCodeErr, setVeryCodeErr] = useState(false);

  const [bindVisitorOpen, setBindVisitorOpen] = useState(false);

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
    // (window as any).NativeApi_OpenBrowser(dataTitle);
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
      let res = await loginApi.phoneCodeLogin({
        phone: phoneNumber,
        verification_code: verificationCode,
        platform: 3,
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

        const loginModal = document.querySelector(
          ".login-modal"
        ) as HTMLElement | null;

        if (loginModal) {
          loginModal.style.display = "none";
        }

        // 3个参数 用户信息 是否登录 是否显示登录
        dispatch(setAccountInfo(res.data.user_info, true, false));

        // eslint-disable-next-line no-restricted-globals
        // @ts-ignore
        // window.location.reload();
        console.log("关闭跳转");
      } else {
        setVeryCode(false);
        setVeryCodeErr(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const close = async () => {
    dispatch(setAccountInfo(undefined, undefined, false));
    // eslint-disable-next-line no-restricted-globals
    // @ts-ignore
    // window.location.reload();
    console.log("关闭跳转");
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
          <button onClick={handleLogin}>登录</button>
          {/* <button
            onClick={() => {
              setBindVisitorOpen(true);
              dispatch(setAccountInfo(undefined, false, false));
              dispatch(updateBindPhoneState(true));
            }}
          >
            登录
          </button> */}
        </div>
        <div
          className="visitor-login-text"
          onClick={handlevisitorLogin}
          data-title="https://i.ali213.net/oauth.html?appid=yxjsqaccelerator&redirect_uri=https://cdn.accessorx.com/web/user_login.html&response_type=code&scope=webapi_login&state=state"
        >
          <img src={visitorLoginIcon} alt="" />
          游侠登录
        </div>
      </div>
    </div>
  );
};

export default Login;
