import { useState, useEffect, Fragment } from "react";
import { Input, Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import { validateRequiredParams } from "@/common/utils";
import {
  setMinorState,
  setBindState,
  setSetting,
} from "@/redux/actions/modal-open";

import "./index.scss";
import webSocketService from "@/common/webSocketService";
import loginApi from "@/api/login";

const typeObj: any = {
  unbind: {
    title: `解除绑定${process.env.REACT_APP_TID_NAME || ""}账号`,
    text: `解除绑定${
      process.env.REACT_APP_TID_NAME || ""
    }账号需先验证已绑定手机号码，点击“获取验证码”完成验证`,
  }, // 三方解绑
  third: {
    title: `绑定${process.env.REACT_APP_TID_NAME || ""}账号`,
    text: `绑定${
      process.env.REACT_APP_TID_NAME || ""
    }账号需先验证已绑定手机号码，点击“获取验证码”完成验证`,
  }, // 三方绑定
  oldPhone: {
    title: "更换手机号码",
    text: "更换手机号码需先验证已绑定手机号码，点击“获取验证码”完成验证",
  }, // 验证旧手机号
  newPhone: {
    title: "更换手机号码",
    text: "请输入新手机号码，点击“获取验证码”完成验证",
  }, // 切换新手机号
};

const errorObj: any = {
  quik: "您的操作频率太快，请稍后再试",
  error: "验证码错误，请重新输入",
};

const submitObj: any = ["unbind", "newPhone"];
const lockPhoneObj: any = ["unbind", "third", "oldPhone"];

const BindPhoneMode: React.FC = (props) => {
  const token = localStorage.getItem("token") || "{}";

  const dispatch: any = useDispatch();
  const accountInfoRedux: any = useSelector((state: any) => state.accountInfo);
  const { open = false, type = "" } = useSelector(
    (state: any) => state?.modalOpen?.bindState
  );

  const [bindType, setBindType] = useState(""); // third oldPhone newPhone
  const [countdown, setCountdown] = useState(0);

  const [phone, setPhone] = useState(accountInfoRedux?.userInfo?.phone);
  const [code, setCode] = useState("");

  const [isPhone, setIsPhone] = useState(false);
  const [veryCodeErr, setVeryCodeErr] = useState("");

  const modalTitle = typeObj?.[bindType]?.title;
  const modalText = typeObj?.[bindType]?.text;

  const close = () => {
    setBindType("");
    setCountdown(0);
    setCode("");
    setVeryCodeErr("");
    setIsPhone(false);
    dispatch(setBindState({ open: false, type: "" }));
  };

  // 获取短信验证码
  const codeCallback = async (captcha_verify_param: any) => {
    try {
      if (captcha_verify_param?.ret !== 0) {
        return;
      }

      const reqire = await validateRequiredParams({ phone });

      if (bindType === "newPhone" && !reqire) {
        return;
      }

      let res =
        bindType === "newPhone"
          ? await loginApi.getPhoneCode({
              phone,
              ticket: captcha_verify_param.ticket,
              randstr: captcha_verify_param.randstr,
            })
          : await loginApi.sendSmsCode({
              ticket: captcha_verify_param.ticket,
              randstr: captcha_verify_param.randstr,
              platform: 3,
            });

      if (res?.error === 0) {
        setCountdown(60);

        const interval = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
        }, 61000); // 120秒后清除定时器
      } else if (res?.error === 210005) {
        setVeryCodeErr("quik");
      }
    } catch (error) {
      console.log("验证码错误", error);
    }
  };

  // 定义验证码js加载错误处理函数
  const loadErrorCallback = () => {
    let appid = process.env.REACT_APP_CAPTCHA_APPID_LOGIN; // 生成容灾票据或自行做其它处理
    let ticket =
      "terror_1001_" + appid + Math.floor(new Date().getTime() / 1000);

    codeCallback({
      ret: 0,
      randstr: "@" + Math.random().toString(36).substr(2),
      ticket,
      errorCode: 1001,
      errorMessage: "jsload_error",
    });
  };

  // 验证当前用户手机号
  const handleVerifyCode = () => {
    try {
      let phoneNumberRegex = /^1[3456789]\d{9}$/; // 检查手机号格式是否正确
      let isPhone = phoneNumberRegex.test(phone);

      if (!isPhone && bindType === "newPhone") {
        setIsPhone(true);
        return;
      } else {
        setIsPhone(false);
      }

      let captcha = new (window as any).TencentCaptcha(
        process.env.REACT_APP_CAPTCHA_APPID_LOGIN,
        codeCallback,
        {
          userLanguage: "zh",
        }
      );

      captcha.show();
    } catch (error) {
      loadErrorCallback();
    }
  };

  // 校验用户手机号
  const verifyPhone = async () => {
    try {
      const params = {
        verification_code: code,
      };
      const reqire = await validateRequiredParams(params);

      if (!reqire) {
        return;
      }

      let res = await loginApi.verifyPhone(params);

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  // 切换手机号api
  const handleUpdatePhone = async () => {
    try {
      const params = {
        phone,
        verification_code: code,
      };
      const reqire = await validateRequiredParams(params);

      if (!reqire) {
        return;
      }

      let res = await loginApi.updatePhone(params);

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  // 解绑手机号api
  const handleUnbindPhone = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      let res = await loginApi.unbindPhone({
        tid: Number(process.env.REACT_APP_TID),
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  };

  // 点击按钮进行触发
  const handlevisitorLogin = async (event: any) => {
    try {
      if (bindType === "third") {
        const reqire = await validateRequiredParams();

        if (!reqire) {
          return;
        }

        let res = await verifyPhone();

        if (res?.error === 0) {
          close();
          dispatch(setSetting({ settingOpen: false, type: "default" }));
          const target = document.querySelector(".last-login-text") as any;
          const dataTitle = target?.dataset?.title;
          (window as any).NativeApi_PartnerAuth(dataTitle);
        } else {
          setVeryCodeErr("error");
        }
      } else if (bindType === "unbind") {
        let res = await handleUnbindPhone();

        if (res?.error === 0) {
          close();
          dispatch(setMinorState({ open: true, type: "unbind" }));
        }
      } else if (bindType === "oldPhone") {
        const reqire = await validateRequiredParams();

        if (!reqire) {
          return;
        }

        let res = await verifyPhone();
        console.log(res, res?.error);

        if (res?.error === 0) {
          setBindType("newPhone");
          setCountdown(0);
          setPhone("");
          setCode("");
          setVeryCodeErr("");
          setIsPhone(false);
        } else {
          setVeryCodeErr("error");
        }
      } else if (bindType === "newPhone") {
        let res = await handleUpdatePhone();

        if (res?.error === 0) {
          close();
          dispatch(setMinorState({ open: true, type: "updatePhone" }));

          localStorage.setItem("token", JSON.stringify(res.data.token));
          localStorage.setItem(
            "is_new_user",
            JSON.stringify(res.data.is_new_user)
          );
          localStorage.setItem(
            "vip_experience_time",
            JSON.stringify(res.data.vip_experience_time)
          );
          if (
            res.data.user_info.user_ext === null ||
            res.data.user_info.user_ext.idcard === ""
          ) {
            localStorage.setItem("isRealName", "1");
          } else {
            localStorage.setItem("isRealName", "0");
          }
          // 3个参数 用户信息 是否登录 是否显示登录
          dispatch(setAccountInfo(res.data.user_info, true, false));
          webSocketService.loginReconnect();
        } else {
          setVeryCodeErr("error");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBindType(type);
    setPhone(accountInfoRedux?.userInfo?.phone);
  }, [type]);

  return (
    <Fragment>
      <Modal
        className="bind-phone-module"
        open={open}
        width={"67.6vw"}
        onCancel={close}
        title={modalTitle}
        destroyOnClose
        centered
        maskClosable={false}
        footer={null}
      >
        <div className="bind-phone-module-content">
          <p className="bind-content-text">{modalText}</p>
          {lockPhoneObj.includes(bindType) ? (
            <div className="old-phone">+86 {phone}</div>
          ) : null}
          {bindType === "newPhone" ? (
            <div className="old-phone-box">
              <div>新的手机号</div>
              <Input
                className="old-phone-input"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
              />
              {isPhone ? (
                <div className="code-error">手机号无效，请重新输入</div>
              ) : null}
            </div>
          ) : null}
          {/* 验证码 */}
          <div className="code-box">
            <div>验证码</div>
            <div className="code-input">
              <Input
                value={code}
                onChange={(e: any) => setCode(e.target.value)}
              />
              {countdown > 0 ? (
                <div className="count-code">{countdown}秒后重新获取</div>
              ) : (
                <div className="code" onClick={handleVerifyCode}>
                  获取验证码
                </div>
              )}
              {veryCodeErr && (
                <div className="code-error">{errorObj?.[veryCodeErr]}</div>
              )}
            </div>
          </div>
          <div
            className="last-login-box"
            style={{ marginTop: bindType === "newPhone" ? "27vh" : "30vh" }}
          >
            <button
              className="last-login-text"
              onClick={(e) => handlevisitorLogin(e)}
              disabled={!code || !phone}
              data-title={`${process.env.REACT_APP_PARTNER_HTML_URL}${
                process.env.REACT_APP_PARTNER_URL
              }?token=${JSON.parse(
                token
              )}&response_type=code&scope=webapi_login&state=state`}
            >
              {submitObj.includes(bindType) ? "提交" : "下一步"}
            </button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default BindPhoneMode;
