import "./index.scss";

export interface CaptchaProps {
  onSend?: (value: any) => void;
  isPhoneNumberValid?: boolean;
  phoneNumber?: string;
  setCountdown?: React.Dispatch<React.SetStateAction<number>>;
}

const TencentCatcha: React.FC<CaptchaProps> = (props) => {
  const { isPhoneNumberValid } = props;

  const codeCallback = (res: any) => {
    console.log(res);
    if (res.ret === 0) {
    }
  };

  // 定义验证码js加载错误处理函数
  const loadErrorCallback = () => {
    let appid = "193511179"; // 生成容灾票据或自行做其它处理
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
        "193511179",
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

  return (
    <div className="tencent-captcha">
      <div className={`verification-code`} onClick={handleVerifyCode}>
        获取验证码
      </div>
    </div>
  );
};

export default TencentCatcha;
