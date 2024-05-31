import React, { useState } from "react";
import { Modal } from "antd";

import "./index.scss";

interface PayModalProps {
  open?: boolean;
  setOpen?: (e: any) => void;
  info?: any;
  closeModal?: () => void;
}

const payTypeMap: { [key: number]: string } = {
  1: "包月",
  2: "包季",
  3: "包年",
  4: "连续包月",
  5: "连续包季",
  6: "连续包年",
};
const payStatusMap: { [key: number]: string } = {
  1: "待支付",
  2: "支付成功",
  3: "支付失败",
  4: "支付取消",
  5: "支付超时",
};

const PaymentModal: React.FC<PayModalProps> = (props) => {
  const { open, info, setOpen = () => {} } = props;

  return (
    <Modal
      className="payment-module"
      open={open}
      title="会员订单"
      width={"40vw"}
      centered
      onCancel={() => setOpen(null)}
      footer={null}
    >
      <div className="popup-content">
        {info && (
          <>
            <p>
              订单编号:
              <span>{info?.id}</span>
            </p>
            <p>
              充值账号<span>{"18888888888888"}</span>
            </p>
            <p>
              支付类型<span>{payTypeMap?.[info?.pay_type] || "其他"}</span>
            </p>
            <p>
              支付金额<span>{info?.price/100}</span>
            </p>
          </>
        )}

        <button onClick={() => setOpen(null)}>
        {payStatusMap?.[info?.status]}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
