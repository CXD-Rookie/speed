import React from "react";
import { useSelector } from "react-redux";
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
  3: "包半年",
  4: "包年",
  5: "连续包月",
  6: "连续包季",
  7: "连续包半年",
  8: "连续包年",
};
const payStatusMap: { [key: number]: string } = {
  1: "待支付",
  2: "已完成支付",
  3: "支付失败",
  4: "支付取消",
  5: "支付超时",
};

const PaymentModal: React.FC<PayModalProps> = (props) => {
  const { open, info, setOpen = () => {} } = props;

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  return (
    <Modal
      className="payment-module"
      open={open}
      title="会员订单"
      width={"40vw"}
      centered
      maskClosable={false}
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
              充值账号<span>{accountInfo?.userInfo?.phone}</span>
            </p>
            <p>
              支付类型<span>{payTypeMap?.[info?.type] || "其他"}</span>
            </p>
            <p>
              支付金额<span>{info?.price / 100}</span>
            </p>
          </>
        )}

        <button style={{ cursor: "pointer" }} onClick={() => setOpen(null)}>
          {payStatusMap?.[info?.status]}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
