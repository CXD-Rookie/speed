import React, { Fragment, useState } from "react";
import { Modal } from "antd";

import "./index.scss";

import visitorLoginIcon from "@/assets/images/common/visitor-login.svg";

interface VisitorLoginProps {}

const VisitorLogin: React.FC<VisitorLoginProps> = (props) => {
  const {} = props;

  const [open, setOpen] = useState(false);

  const handlevisitorLogin = async (event: any) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;

    (window as any).NativeApi_OpenBrowser(dataTitle);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <div
        className="visitor-login-text"
        onClick={handlevisitorLogin}
        data-title="https://i.ali213.net/oauth.html?appid=yxjsqaccelerator&redirect_uri=https://cdn.accessorx.com/web/user_login.html&response_type=code&scope=webapi_login&state=state"
      >
        <img src={visitorLoginIcon} alt="" />
        游侠登录
      </div>
      {open ? (
        <Modal
          className="visitor-login"
          open={open}
          onCancel={onClose}
          title={null}
          width={"67.7vw"}
          centered
          maskClosable={false}
          footer={null}
        >
          <iframe
            id="myIframe"
            src={`https://i.ali213.net/oauth.html?appid=yxjsqaccelerator&redirect_uri=https://cdn.accessorx.com/web/user_login.html&response_type=code&scope=webapi_login&state=state`}
          />
        </Modal>
      ) : null}
    </Fragment>
  );
};

export default VisitorLogin;
