import { useEffect, useState } from "react";
import { Button, Modal, Tabs } from "antd";

import "./index.scss";
import noIcon from "@/assets/images/common/no-data.svg";
import loseIcon from "@/assets/images/common/yishiyong.svg";

interface CouponProps {
  open: boolean;
}

const CustonCoupon: React.FC<CouponProps> = (props) => {
  const { open } = props;

  const [activeTab, setActiveTab] = useState("make");

  const [couponMaskData, setCouponMaskData] = useState<any>([]); // 未使用数据
  const [couponLoseData, setCouponLoseData] = useState<any>([]); // 已失效数据

  const [mouseoverState, setMouseoverState] = useState(false);

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
                {couponMaskData?.length >= 0 ? (
                  <div className="content-box">
                    <div
                      className="mask-card card"
                      style={{
                        borderColor: mouseoverState ? "#f86c34" : "transparent",
                      }}
                    >
                      <div className="icon-box">
                        <div className="left" />
                        <div className="right" />
                        {}75折
                      </div>
                      <div className="text-box">
                        <div className="title">75折卡</div>
                        <div className="time-box">
                          2天后过期
                          <Button
                            type="default"
                            onMouseOver={() => setMouseoverState(true)}
                            onMouseLeave={() => setMouseoverState(false)}
                          >
                            立即使用
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data-box">
                    <img src={noIcon} alt="" />
                    <div>暂无优惠券</div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "lose",
            label: `已失效（${couponLoseData?.length}）`,
            children: (
              <div className="coupon-tabs-content">
                {couponLoseData?.length >= 0 ? (
                  <div className="content-box">
                    <div
                      className="lose-card card"
                      style={{
                        borderColor: mouseoverState ? "#f86c34" : "transparent",
                      }}
                    >
                      <div className="icon-box">
                        <div className="left" />
                        <div className="right" />
                        {}75折
                      </div>
                      <div className="text-box">
                        <div className="title">75折卡</div>
                        <div className="time-text">有效期至</div>
                      </div>
                      <img className="lose-icon" src={loseIcon} alt="" />
                    </div>
                  </div>
                ) : (
                  <div className="no-data-box">
                    <img src={noIcon} alt="" />
                    <div>暂无优惠券</div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default CustonCoupon;