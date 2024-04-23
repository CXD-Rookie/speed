/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-23 11:01:04
 * @FilePath: \speed\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { post } from "@/api/api";
import "./index.scss";

export interface LoginProps {
  setIsLoginModal?: (value: any) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const { setIsLoginModal = () => {} } = props;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const handleGetVerificationCode = () => {
    // 模拟发送获取验证码的请求，这里假设成功后开始倒计时
    if (isPhoneNumberValid) {
      setCountdown(120);
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
      }, 120000); // 120秒后清除定时器
    }
  };

  const handlePhoneNumberBlur = () => {
    // 检查手机号格式是否正确
    const phoneNumberRegex = /^1[3456789]\d{9}$/;
    setIsPhoneNumberValid(phoneNumberRegex.test(phoneNumber));
  };

  const handleLogin = () => {
    // 处理登录逻辑
    console.log("手机号:", phoneNumber);
    console.log("验证码:", verificationCode);
    // setIsLoginModal(false);
    // 在登录成功后处理回调
    post("/login", {
      id: 1,
      username: "user1",
      password: "password1",
    })
      .then((response) => {
        // 从响应中获取 token
        const token = response.token;
        // 将 token 存储到 localStorage 中
        localStorage.setItem("token", token);
        // 进行其他操作，比如页面跳转等
        // 例如，跳转到首页
        // window.location.href = "/home";
      })
      .catch((error) => {
        // 处理登录失败的情况
        console.error("登录失败：", error);
        // 可以在这里进行错误提示等操作
      });
  };

  return (
    <div className="login-modal">
      <h2>登录</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="请输入手机号"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onBlur={handlePhoneNumberBlur}
        />
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="请输入验证码"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
        />

        <button onClick={handleGetVerificationCode} disabled={countdown !== 0}>
          {countdown === 0 ? "获取验证码" : `${countdown}秒后重新获取`}
        </button>
      </div>
      <button onClick={handleLogin}>登录</button>
      <button>微信登录</button>
    </div>
  );
};

export default Login;
