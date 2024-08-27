import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";

import "./index.scss";
import "./new.scss";

import PayErrorModal from "../pay-error";
import PaymentModal from "../payment";
import payApi from "@/api/pay";
import eventBus from "@/api/eventBus";
import loginApi from "@/api/login";
import tracking from "@/common/tracking";
import closeIcon from "@/assets/images/common/cloture.svg";

interface PayModalProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (e: any) => void;
  type?: any;
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
  const { isModalOpen, type, setIsModalOpen = () => {} } = props;

  const dispatch: any = useDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const intervalIdRef: any = useRef(null); // 用于存储interval的引用
  //@ts-ignore
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [, setPayTypes] = useState<{ [key: string]: string }>({});
  const [firstPayTypes, setFirstPayTypes] = useState<{ [key: string]: string }>(
    {}
  );
  const [firstPayRenewedTypes, setFirstPayRenewedTypes] = useState<{
    [key: string]: string;
  }>({});
  const [activeTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  //@ts-ignore
  const [userToken] = useState(accountInfo.userInfo.id);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  const [payErrorModalOpen, setPayErrorModalOpen] = useState(false);

  const [pollingTime, setPollingTime] = useState(5000); // 轮询支付接口的时间
  const [QRCodeState, setQRCodeState] = useState("normal"); // 二维码状态 normal 正常 incoming 支付中 timeout 超时
  const [, setPollingTimeNum] = useState(0); // 轮询支付接口时长
  const [refresh, setRefresh] = useState(0); // 控制是否属性页面重新请求

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

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
    console.log("data-title:", dataTitle);
  };

  useEffect(() => {
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
        // console.log(commodityResponse, "6666666666666666666666");
        if (
          payTypeResponse.error === 0 &&
          commodityResponse.error === 0 &&
          (unpaidOrder.data != null ||
            unpaidOrder.data != "" ||
            unpaidOrder.data != undefined)
        ) {
          setPayTypes(payTypeResponse.data);
          setCommodities(commodityResponse.data.list);
          setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
          setFirstPayRenewedTypes(firstPurchaseResponse.data.first_renewed);
          // Fetch the initial QR code URL based on the first commodity
          if (commodityResponse.data.list.length > 0) {
            const newKey = guid();
            setPollingKey(newKey);
            setQrCodeUrl(
              `${process.env.REACT_APP_API_URL}/pay/qrcode?cid=${
                commodityResponse.data.list[0].id
              }&user_id=${userToken}&key=${newKey}&platform=${3}`
            );
          }
        } else {
          eventBus.emit("showModal", { show: true, type: "connectionPay" }); //发现重复订单继续支付
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken, refresh]);

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
          `${process.env.REACT_APP_API_URL}/pay/qrcode?cid=${
            commodities[activeTabIndex].id
          }&user_id=${userToken}&key=${newKey}&platform=${3}`
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
        // console.log(response, "initialQrCodeResponse------");

        if (response.error === 0) {
          const status = response.data?.status;

          if (status) {
            setPaymentStatus(status);
            setQRCodeState("incoming");
            setPollingTime(3000);
            setPollingTimeNum(0);
          } else if (QRCodeState === "normal") {
            setPollingTimeNum((num) => {
              const time = num + pollingTime;

              if (time >= 120000) {
                setQRCodeState("timeout");
                setPollingTimeNum(0);
                return 0;
              } else {
                return time;
              }
            });
          }

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

          if ([2, 3].includes(status)) {
            setRefresh(refresh + 1);
            setQRCodeState("normal");
            setPollingTime(5000);
            setPollingTimeNum(0);
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
    }, pollingTime);

    intervalIdRef.current = intervalId;

    return () => {
      if (paymentStatus !== 1 || QRCodeState === "timeout") {
        clearInterval(intervalId);
        clearInterval(intervalIdRef?.current);
      }
    };
  }, [paymentStatus, pollingKey, QRCodeState]);

  useEffect(() => {
    // 当 paymentStatus 或 QRCodeState 发生变化时，确保定时器被清除
    if (QRCodeState === "timeout") {
      clearInterval(intervalIdRef?.current);
    }
  }, [paymentStatus, QRCodeState, isModalOpen]);

  return (
    <Fragment>
      <Modal
        className="pay-module pay-module-new"
        open={isModalOpen}
        onCancel={() => {
          clearInterval(intervalIdRef?.current);
          setIsModalOpen(false)
        }}
        title=""
        destroyOnClose
        width={"92vw"}
        centered
        closeIcon={null}
        maskClosable={false}
        footer={null}
      >
        <div className="pay-modal">
          <div className="close-icon" onClick={() => {
            setIsModalOpen(false)
            clearInterval(intervalIdRef?.current)
          }}>
            <img src={closeIcon} alt="" />
          </div>
          <div
            className={
              type === 2 ? "new-design" : type === 3 ? "new-design2" : ""
            }
          >
            <div className="newMain">
              {commodities.map((item, index) => (
                <div
                  key={index}
                  className="carousel-item dl"
                  style={{
                    display: index === activeTabIndex ? "block" : "none",
                  }}
                >
                  <p className="highlight">
                    月卡
                    {!firstAuth.firstAuth.first_purchase && (
                      <span>
                        {Number(firstPayRenewedTypes[item.type]) / 10}
                      </span>
                    )}
                    {!firstAuth.firstAuth.first_renewed && (
                      <span>{Number(firstPayTypes[item.type]) / 10}</span>
                    )}
                    折
                  </p>
                  <div className="price" data-price={item.price}>
                    ¥<span className="priceBigNew">{item.price}</span>/月
                  </div>
                  <div className="term">
                    原价：￥{item.scribing_month_price}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="main">
            {qrCodeUrl && (
              <div className="qrcode">
                <img className="header-icon" src={qrCodeUrl} alt="" />
                {QRCodeState !== "normal" && (
                  <div className="pay-mask">
                    <div className="title">
                      {QRCodeState === "incoming" && "手机支付中"}
                      {QRCodeState === "timeout" && "二维码已超时"}
                    </div>
                    <div className="text">
                      {QRCodeState === "incoming" && "如遇到问题"}
                      <span
                        onClick={() => {
                          setRefresh(refresh + 1);
                          setQRCodeState("normal");
                          setPollingTime(5000);
                          setPollingTimeNum(0);
                        }}
                      >
                        点击刷新
                      </span>
                    </div>
                    <div>
                      {QRCodeState === "timeout" && "二维码"}
                      {QRCodeState === "incoming" && "二维码重试"}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="carousel">
              {commodities.map((item, index) => (
                <div
                  key={index}
                  className="carousel-item"
                  style={{
                    display: index === activeTabIndex ? "block" : "none",
                  }}
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
                        》
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <PaymentModal
        open={!!showPopup}
        info={orderInfo}
        setOpen={(e) => {
          clearInterval(intervalIdRef?.current);
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
    </Fragment>
  );
};

export default PayModal;
