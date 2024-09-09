import { useEffect, useState } from "react";
import { Modal, Tabs } from "antd";

import "./index.scss";
import noIcon from "@/assets/images/common/no-data.svg";

interface CouponProps {
  open: boolean;
}

const CustonCoupon: React.FC<CouponProps> = (props) => {
  const { open } = props;

  const [activeTab, setActiveTab] = useState("make");

  const [couponMaskData, setCouponMaskData] = useState<any>([]); // 未使用数据
  const [couponLoseData, setCouponLoseData] = useState<any>([]); // 已失效数据

  const onClose = () => {

  }

  useEffect(() => {
    setCouponMaskData([]);
    setCouponLoseData([])
  }, []);

  return (
    <Modal
      className="custon-coupon"
      open={open}
      onCancel={onClose}
      title="我的优惠券"
      width={"67.6vw"}
      centered
      maskClosable={false}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key: string) => setActiveTab(key)}
        items={[
          {
            key: "make",
            label: `未使用（${couponMaskData?.length}）`,
            children: (
              <div className="coupon-tabs-content">
                {couponMaskData?.length > 0 ? <div></div> : null}
              </div>
            ),
          },
          {
            key: "lose",
            label: `已失效（${couponLoseData?.length}）`,
            // disabled: loading,
            children: <div></div>,
          },
        ]}
      />
    </Modal>
  );
};

export default CustonCoupon;