import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";

import tracking from "@/common/tracking";
import "./index.scss";
import PayErrorModal from "../pay-error";
import TooltipCom from "./tooltip";
import payApi from "@/api/pay";
import loginApi from "@/api/login";
import PaymentModal from "../payment";
import BreakConfirmModal from "../break-confirm";

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
  scribing_month_price: string;
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

  const dispatch: any = useDispatch();
  //@ts-ignore
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({});
  const [firstPayTypes, setFirstPayTypes] = useState<{ [key: string]: string }>(
    {}
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  //@ts-ignore
  const [userToken, setUserToken] = useState(accountInfo.userInfo.id);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  const [payErrorModalOpen, setPayErrorModalOpen] = useState(false);
  const [firstPurchase, setFirstPurchase] = useState(false);
  const [firstRenewal, setFirstRenewal] = useState(false);
  const [isOldUser, setIsOldUser] = useState(false);
  const [connectionPayOpen, setConnectionPayOpen] = useState(false); // 当前是否有订单处理中弹窗

  const [arrow, setArrow] = useState(0) // 移动的位置

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
    const isNewUser = localStorage.getItem("is_new_user") === "true";
    const fetchData = async () => {
      try {
        const [
          payTypeResponse,
          commodityResponse,
          firstPurchaseResponse,
          unpaidOrder,
        ] = await Promise.all([
          payApi.getPayTypeList(),
          payApi.getCommodityList(),
          payApi.getfirst_purchase_renewed_discount(),
          payApi.UnpaidOrder(),
        ]);
        if (
          payTypeResponse.error === 0 &&
          commodityResponse.error === 0 &&
          (unpaidOrder.data != null ||
            unpaidOrder.data != "" ||
            unpaidOrder.data != undefined)
        ) {
          // setConnectionPayOpen(true); //发现重复订单继续支付
          setPayTypes(payTypeResponse.data);
          setCommodities(commodityResponse.data.list);

          const { first_purchase, first_renewed } = firstAuth.firstAuth;
          if (!first_purchase && !first_renewed) {
            //测试数据
            // setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
            // setFirstPurchase(true);
            setIsOldUser(true);//正式
          } else if (first_purchase && !first_renewed) {
            setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
            setFirstPurchase(true);
;
          } else if (!first_purchase && first_renewed) {
            setFirstPayTypes(firstPurchaseResponse.data.first_renewed);
            setFirstRenewal(true)
          }
          // Fetch the initial QR code URL based on the first commodity
          if (commodityResponse.data.list.length > 0) {
            const newKey = guid();
            setPollingKey(newKey);
            setQrCodeUrl(
              `https://test-api.accessorx.com/api/v1/pay/qrcode?cid=${commodityResponse.data.list[0].id}&user_id=${userToken}&key=${newKey}&platform=${3}`
            );
          }
        } else {
          setConnectionPayOpen(true); //发现重复订单继续支付
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

  const updateQrCode = async () => {
    if (commodities.length > 0) {
      try {
        const newKey = guid();
        setPollingKey(newKey);
        setQrCodeUrl(
          `https://test-api.accessorx.com/api/v1/pay/qrcode?cid=${commodities[activeTabIndex].id}&user_id=${userToken}&key=${newKey}&platform=${3}`
        );
      } catch (error) {
        console.error("Error updating QR code", error);
      }
    }
  };

  useEffect(() => {
    tracking.trackPurchasePageShow();
    updateQrCode();
  }, [activeTabIndex, commodities, userToken]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await payApi.getPolling({
          key: pollingKey,
        });
        console.log(response, "initialQrCodeResponse------");

        if (response.error === 0) {
          const status = response.data?.status;
          if (status === 2) {
            console.log("支付成功");
            let jsonResponse = await loginApi.userInfo();

            // 3个参数 用户信息 是否登录 是否显示登录
            dispatch(
              setAccountInfo(jsonResponse.data.user_info, undefined, undefined)
            );

            localStorage.setItem(
              "token",
              JSON.stringify(jsonResponse.data.token)
            );
          }
          if (status !== 1 && response.data?.cid) {
            const res = await payApi.getCommodityInfo(response.data?.cid);
            console.log(res, "订单信息----------", response);

            setPaymentStatus(status);
            setShowPopup(null);
            setOrderInfo({ ...res.data, ...response.data });

            if (status === 5 || status === 3 || status === 4) {
              setPayErrorModalOpen(true);
            }

            setShowPopup(
              status === 2 ? "支付成功" : status === 1 ? "待支付" : null
            );

            return () => clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    }, 3000);

    if (paymentStatus !== 1) {
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
        destroyOnClose
        width={"67.6vw"}
        centered
        maskClosable={false}
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
            {commodities?.length > 4 && (
              <Fragment>
                <div
                  className="arrow left"
                  onClick={() => {
                    if (!(arrow === 0)) {
                      setArrow(arrow + 1);
                    }
                  }}
                />
                <div
                  className="arrow right"
                  onClick={() => {
                    if (!(arrow === -(commodities?.length - 4))) {
                      setArrow(arrow - 1);
                    }
                  }}
                />
              </Fragment>
            )}
            <div className="tabs">
              {commodities.map((item, index) => (
                <div
                  key={index}
                  className={`tab ${index === activeTabIndex ? "active" : ""}`}
                  style={{ transform: `translateX(${arrow * 15.25}vw)` }}
                  onClick={() => updateActiveTabIndex(index)}
                >
                  {(firstAuth.firstAuth.first_purchase ||
                    firstAuth.firstAuth.first_renewed) && (
                    <div className={`${isOldUser ? "" : "discount"}`}>
                      {!firstAuth.firstAuth.first_purchase &&
                        `续费${Number(firstPayTypes[item.type]) / 10}折`}
                      {!firstAuth.firstAuth.first_renewed &&
                        `首充${Number(firstPayTypes[item.type]) / 10}折`}
                    </div>
                  )}
                  <div className="term">{payTypes[item.type]}</div>
                  <div className="price">
                    ¥<span className="price-text">{item.month_price}</span>/月
                    <span className="text">¥{item.scribing_month_price}</span>
                  </div>
                  <div className="amount">
                    总价：¥<span>{item.price}</span>
                    <span className="text">原价: ¥{item.scribing_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="line"></div>
          {qrCodeUrl && (
            <div className="qrcode">
              <img className="header-icon" src={qrCodeUrl} alt="" />
            </div>
          )}
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
                        style={{ cursor: "pointer" }}
                        className="txt"
                        onClick={handleClick}
                        ref={divRef}
                        data-title="https://cdn.accessorx.com/web/terms_of_service.html"
                      >
                        用户协议
                      </div>
                      》及《
                      <div
                        style={{ cursor: "pointer" }}
                        className="txt"
                        onClick={handleClick}
                        ref={divRef}
                        data-title="https://cdn.accessorx.com/web/automatic_renewal_agreement.html"
                      >
                        自动续费协议
                      </div>
                      》到期按每月29元自动续费，可随时取消 <TooltipCom />
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
        setOpen={(e) => {
          setIsModalOpen(false);
          setShowPopup(e);
        }}
      />
      {payErrorModalOpen ? (
        <PayErrorModal
          accelOpen={payErrorModalOpen}
          setAccelOpen={(e) => {
            updateQrCode();
            setPayErrorModalOpen(e);
          }}
          onConfirm={() => {
            updateQrCode();
            setPayErrorModalOpen(false);
          }}
        />
      ) : null}

      {connectionPayOpen ? (
        <BreakConfirmModal
          accelOpen={connectionPayOpen}
          type={"connectionPay"}
          setAccelOpen={setConnectionPayOpen}
          onConfirm={() => {
            setConnectionPayOpen(false);
            setIsModalOpen(false);
          }}
        />
      ) : null}
    </Fragment>
  );
};

export default PayModal;
