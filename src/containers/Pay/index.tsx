import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";

import payApi from "@/api/pay";
import "./index.scss";
import PaymentModal from "../payment";

interface PayModalProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (e: any) => void;
}

interface Commodity {
  id: string;
  name: string;
  type: number;
  price: string;
  month_price: string;
  scribing_price: string;
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

const PayModal: React.FC<PayModalProps> = (props) => {
  const { isModalOpen, setIsModalOpen = () => {} } = props;

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [userToken, setUserToken] = useState("664c90bbfa7788e5974bb89a" || "");
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  // const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);
  // const dispatch = useDispatch();

  // const handleClose = () => {
  //   dispatch(closeRealNameModal());
  // };


  const payTypeMap: { [key: number]: string } = {
    1: "包月",
    2: "包季",
    3: "包年",
    4: "连续包月",
    5: "连续包季",
    6: "连续包年",
  };

  const guid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const [pollingKey, setPollingKey] = useState<string>(guid());

  const updateActiveTabIndex = (index: number) => {
    setActiveTabIndex(index);
    console.log(index, "---------------");
  };

  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
    console.log("data-title:", dataTitle);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payTypeResponse, commodityResponse] = await Promise.all([
          payApi.getPayTypeList(),
          payApi.getCommodityList(),
        ]);

        if (payTypeResponse.error === 0 && commodityResponse.error === 0) {
          setPayTypes(payTypeResponse.data);
          setCommodities(commodityResponse.data.list);

          // Fetch the initial QR code URL based on the first commodity
          if (commodityResponse.data.list.length > 0) {
            const newKey = guid();
            setPollingKey(newKey);
            setQrCodeUrl(
              `https://rm-mga-dev.yuwenlong.cn/api/v1/pay/qrcode?cid=${commodityResponse.data.list[0].id}&user_id=${userToken}&key=${newKey}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken]);

  useEffect(() => {
    const handleLeftArrowClick = () => {
      const tabsContainer =
        document.querySelector<HTMLElement>(".tabs-container");
      if (tabsContainer) {
        const scrollAmount =
          tabsContainer.scrollLeft - tabsContainer.offsetWidth;
        tabsContainer.scrollTo({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    };

    const handleRightArrowClick = () => {
      const tabsContainer =
        document.querySelector<HTMLElement>(".tabs-container");
      if (tabsContainer) {
        const scrollAmount =
          tabsContainer.scrollLeft + tabsContainer.offsetWidth;
        tabsContainer.scrollTo({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    };

    const leftArrow = document.querySelector(".arrow.left");
    const rightArrow = document.querySelector(".arrow.right");

    if (leftArrow) {
      leftArrow.addEventListener("click", handleLeftArrowClick);
    }

    if (rightArrow) {
      rightArrow.addEventListener("click", handleRightArrowClick);
    }

    return () => {
      if (leftArrow) {
        leftArrow.removeEventListener("click", handleLeftArrowClick);
      }
      if (rightArrow) {
        rightArrow.removeEventListener("click", handleRightArrowClick);
      }
    };
  }, []);

  useEffect(() => {
    const updateQrCode = async () => {
      if (commodities.length > 0) {
        try {
          const newKey = guid();
          setPollingKey(newKey);
          setQrCodeUrl(
            `https://rm-mga-dev.yuwenlong.cn/api/v1/pay/qrcode?cid=${commodities[activeTabIndex].id}&user_id=${userToken}&key=${newKey}`
          );
        } catch (error) {
          console.error("Error updating QR code", error);
        }
      }
    };

    updateQrCode();
  }, [activeTabIndex, commodities, userToken]);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await payApi.getPolling({
          key: pollingKey,
        });
        console.log(response, "initialQrCodeResponse------");

        if (response.error === 0) {
          const status = response.data?.status;

          if (status === 1 || !response.data) {
            setPaymentStatus(status);
            setShowPopup(null);
            setOrderInfo(response.data);
            // 如果订单未支付或者响应数据为空，则继续轮询
            if (status === 1 || !response.data) {
              setTimeout(fetchPaymentStatus, 3000);
            }
          } else {
            setShowPopup(
              status === 2
                ? "支付成功"
                : status === 3
                ? "支付失败"
                : status === 4
                ? "支付取消"
                : status === 5
                ? "支付超时"
                : null
            );
          }
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    };

    if (paymentStatus !== 1) {
      const intervalId = setInterval(fetchPaymentStatus, 3000);

      return () => clearInterval(intervalId);
    }
  }, [paymentStatus, pollingKey]);

  return (
    <Fragment>
      <Modal
        className="pay-module"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title="会员充值"
        width={"67.6vw"}
        centered
        footer={null}
      >
        <div className="pay-modal">
          <div className="headerAll">
            <div className="title">全平台会员特权</div>
            <div className="description">
              电竞专线/海外专线/超低延迟/动态多包/智能加速/多平台加速
            </div>
          </div>
          <div className="tabs-container">
            <div className="arrow left"></div>
            <div className="tabs">
              {commodities.map((item, index) => (
                <div
                  key={index}
                  className={`tab ${index === activeTabIndex ? "active" : ""}`}
                  onClick={() => updateActiveTabIndex(index)}
                >
                  <ul>
                    <li>{payTypes[item.type]}</li>
                    <li>
                      ¥<span className="price">{item.month_price}</span>/月
                    </li>
                    <li>
                      总价：¥<span>{item.price}</span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
            <div className="arrow right"></div>
          </div>
          <div className="line"></div>
          <div className="qrcode">
            <img className="header-icon" src={qrCodeUrl} alt="" />
          </div>
          <div className="carousel">
            {commodities.map((item, index) => (
              <div
                key={index}
                className="carousel-item"
                style={{ display: index === activeTabIndex ? "block" : "none" }}
              >
                <div className="priceAll" data-price={item.price}>
                  <ul>
                    <li>
                      <span className="txt">支付宝或微信扫码支付</span>
                    </li>
                    <li>
                      <span className="priceBig">{item.price}</span>
                    </li>
                    <li>
                      我已同意《
                      <div
                        className="txt"
                        onClick={handleClick}
                        ref={divRef}
                        data-title="https://tc-js.yuwenlong.cn/terms_of_service.html"
                      >
                        用户协议
                      </div>
                      》及《
                      <div
                        className="txt"
                        onClick={handleClick}
                        ref={divRef}
                        data-title="https://tc-js.yuwenlong.cn/automatic_renewal_agreement.html"
                      >
                        自动续费协议
                      </div>
                      》到期按每月29元自动续费，可随时取消{" "}
                      <i className="tips">?</i>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      <PaymentModal
        open={!!showPopup}
        info={orderInfo}
        setOpen={(e) => setShowPopup(e)}
      />
    </Fragment>
  );
};

export default PayModal;
