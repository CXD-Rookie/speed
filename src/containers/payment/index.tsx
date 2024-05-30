import React, { useState } from "react";
import { Modal } from "antd";

import "./index.scss";

interface PayModalProps {
  isModalOpen?: boolean;
  closeModal?: () => void;
}

interface OrderInfo {
  id: string;
  uid: string;
  cid: string;
  qrcode_key: string;
  price: number;
  status: number;
  pay_order: string;
  pay_type: number;
  is_deleted: boolean;
  create_time: number;
  update_time: number;
}

const payTypeMap: { [key: number]: string } = {
  1: "包月",
  2: "包季",
  3: "包年",
  4: "连续包月",
  5: "连续包季",
  6: "连续包年",
};

const PaymentModal: React.FC<PayModalProps> = (props) => {
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  return (
    <Modal open={!!showPopup} onCancel={() => setShowPopup(null)} footer={null}>
      {showPopup && (
        <div className="popup-content">
          {orderInfo && (
            <>
              <p>订单编号: {orderInfo.pay_order}</p>
              <p>充值账号: {"18888888888888"}</p>
              <p>支付类型: {payTypeMap[orderInfo.pay_type] || "其他"}</p>
              <p>支付金额: ¥{orderInfo.price}</p>
            </>
          )}
          <button onClick={() => setShowPopup(null)}>showPopup</button>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
