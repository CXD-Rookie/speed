import { validateRequiredParams } from "@/common/utils";

import "./index.scss";
import loginApi from "@/api/login";

export interface CaptchaProps {
  isPhoneNumberValid?: boolean;
  phoneNumber?: string;
  onSend?: (value: any) => void;
  onResetErrors?: (value?: any) => void; // 取消手机号错误提示展示
  // 发送触发错误类型 type = code | phone 验证 | 手机号 错误 state = 错误状态 1 | 2
  onSendErrors?: (type: string, state?: string) => void;
  setCountdown?: React.Dispatch<React.SetStateAction<number>>;
}

const TencentCatcha: React.FC<CaptchaProps> = (props) => {
  const {
    phoneNumber,
    setCountdown = () => {},
    onResetErrors = () => {},
    onSendErrors = () => {}, 
  } = props;

  const codeCallback = async (captcha_verify_param: any) => {
    try {
      if (captcha_verify_param?.ret !== 0) {
        return;
      }

      const reqire = await validateRequiredParams(
        { phone: phoneNumber },
        false
      );

      if (!reqire) {
        return;
      }

      let res = await loginApi.getPhoneCode({
        phone: phoneNumber,
        ticket: captcha_verify_param.ticket,
        randstr: captcha_verify_param.randstr,
      });

      if (res?.error === 0) {
        setCountdown(60);
        onSendErrors("code", "0"); // 验证码获取成功将错误去掉

        const interval = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
        }, 121000); // 120秒后清除定时器
      } else if (res?.error === 210005) {
        onSendErrors("code", "3");
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

  const handleVerifyCode = () => {
    try {
      let captcha = new (window as any).TencentCaptcha(
        process.env.REACT_APP_CAPTCHA_APPID_LOGIN,
        codeCallback,
        {
          userLanguage: "zh",
        }
      );

      onResetErrors();
      captcha.show();
    } catch (error) {
      loadErrorCallback();
    }
  };

  return (
    <div className="tencent-captcha">
      <div className={`verification-code`} onClick={handleVerifyCode}>
        获取验证码
      </div>
    </div>
  );
};

export default TencentCatcha;
