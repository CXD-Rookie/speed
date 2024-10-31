import React, { Fragment } from "react";

import CurrencyExchange from "@/containers/currency-exchange";
import SettingsModal from "@/containers/setting";
import IssueModal from "@/containers/IssueModal";
import BreakConfirmModal from "@/containers/break-confirm";

const RenderSrea:React.FC = () => {
  return (
    <Fragment>
      {/* 口令兑换弹窗 */}
      <CurrencyExchange />
      {/* 设置弹窗 */}
      <SettingsModal />
      {/* 问题反馈弹窗 */}
      <IssueModal />
      {/* 确认退出弹窗 */}
      <BreakConfirmModal />
    </Fragment>
  );
}

export default RenderSrea;