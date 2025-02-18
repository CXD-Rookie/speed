import React, { Fragment } from "react";
import { useSelector } from "react-redux";

import "./index.scss";
import Login from "@/containers/Login";
import CurrencyExchange from "@/containers/currency-exchange";
import SettingsModal from "@/containers/setting";
import IssueModal from "@/containers/IssueModal";
import BreakConfirmModal from "@/containers/break-confirm";
import ActiveNew from "@/containers/active/newOpen";
import AppCloseModal from "@/containers/app-close";
import Active from "@/containers/active";
import PayModalNew from "@/containers/Pay/charge-renewal";
import PayModal from "@/containers/Pay";
import MinorModal from "@/containers/minor";
import BindPhoneMode from "@/containers/bind-phone-mode";
import VisitorLogin from "@/containers/visitor-login";
import DisoverVersion from "@/containers/disover-version";
import LocalGame from "@/containers/local-game";
import ResourceCache from "./resource-cache";

const RenderSrea:React.FC = () => {
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const state = useSelector((state: any) => state?.modalOpen);
  const isBindPhone = useSelector((state: any) => state.auth.isBindPhone);

  const {
    payState = {},
    firstPayRP = {},
    setting = {},
    drawVipActive = {},
    versionState = {},
    localGameState = {},
  } = state;
  
  return (
    <Fragment>
      {/* 登录弹窗 */}
      {accountInfo?.isShowLogin && (
        <div
          className="login-mask"
          style={{
            display: accountInfo?.isShowLogin ? "block" : "none",
          }}
        >
          <Login />
        </div>
      )}
      {/* 口令兑换弹窗 */}
      <CurrencyExchange />
      {/* 设置弹窗 */}
      {setting?.settingOpen && <SettingsModal />}
      {/* 问题反馈弹窗 */}
      <IssueModal />
      {/* 各种提示信息弹窗 */}
      <BreakConfirmModal />
      {/* 新用户提示弹窗 */}
      <ActiveNew />
      {/* 提示修改关闭窗口设置 */}
      <AppCloseModal />
      {/* 领取会员有效期弹窗 */}
      {drawVipActive?.open && <Active />}
      {/* 首续，首充支付弹窗 */}
      {firstPayRP?.open && <PayModalNew />}
      {/* 正常支付页面 */}
      {payState?.open && <PayModal />}
      {/* 实名认证等UI确定弹窗 */}
      <MinorModal />
      {/* 第三方手机绑定类型弹窗 */}
      <BindPhoneMode />
      {/* 三方登录绑定手机号登录 */}
      {isBindPhone && <VisitorLogin />}
      {/* 发现新版本弹窗 */}
      {versionState?.open && <DisoverVersion />}
      {/* 发现本地扫描到的游戏弹窗 */}
      {localGameState?.open && <LocalGame />}
      <ResourceCache />
    </Fragment>
  );
}

export default RenderSrea;