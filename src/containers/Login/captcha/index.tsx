/*
 * @Author: zhangda
 * @Date: 2024-05-09 17:55:10
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-21 20:24:48
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\Login\captcha\index.tsx
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { useEffect } from "react";

import "./index.scss";
import loginApi from "@/api/login";

export interface CaptchaProps {
  onSend?: (value: any) => void;
  isPhoneNumberValid?: boolean;
  phoneNumber?: string;
  setCountdown?: React.Dispatch<React.SetStateAction<number>>;
}
let captcha: any;

const Captcha: React.FC<CaptchaProps> = (props) => {
  const { isPhoneNumberValid, phoneNumber, setCountdown = () => {} } = props;
  const getInstance = (instance: any) => {
    captcha = instance;
  };

  const captchaVerifyCallback = async (captcha_verify_param: any) => {
    let res = await loginApi.getPhoneCode({
      phone: phoneNumber,
      captcha_verify_param,
      scene_id: 1,
    });

    if (res?.error === 0) {
      return {
        captchaResult: true,
        bizResult: true,
      };
    }
  };

  // 验证通过后调用
  const onBizResultCallback = () => {
    setCountdown(60);

    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
    }, 121000); // 120秒后清除定时器
  };

  useEffect(() => {
    (window as any).initAliyunCaptcha({
      SceneId: "1wdbgbcu", // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
      prefix: "o1604o", // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
      mode: "popup", // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
      element: "#captcha-element", // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
      button: "#captcha-button", // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
      captchaVerifyCallback: captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
      onBizResultCallback: onBizResultCallback, // 业务请求结果回调函数，无需修改
      getInstance: getInstance, // 绑定验证码实例函数，无需修改
      slideStyle: {
        width: 360,
        height: 40,
      }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
      language: "cn", // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
    });

    return () => {
      // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
      document.getElementById("aliyunCaptcha-mask")?.remove();
      document.getElementById("aliyunCaptcha-window-popup")?.remove();
    };
  }, []);

  return (
    <div className="captcha-a">
      <div id={"captcha-button"} className={`verification-code`}>
        发送验证码
      </div>
      {isPhoneNumberValid && <div id="captcha-element"></div>}
    </div>
  );
};

export default Captcha;
