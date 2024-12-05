import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setFirstPayRP } from "@/redux/actions/modal-open";

import "./index.scss";
import "./new.scss";

import PayErrorModal from "../pay-error";
import PaymentModal from "../payment";
import payApi from "@/api/pay";
import eventBus from "@/api/eventBus";
import tracking from "@/common/tracking";
import closeIcon from "@/assets/images/common/cloture.svg";

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

const PayModal: React.FC = (props) => {
  const dispatch: any = useDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const intervalIdRef: any = useRef(null); // 用于存储interval的引用

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const { open = false, type = "" } = useSelector(
    (state: any) => state?.modalOpen?.firstPayRP
  );

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

  const [pollingKey, setPollingKey] = useState<string>("");
  const env_url = process.env.REACT_APP_API_URL;

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

  const iniliteReset = () => {
    clearInterval(intervalIdRef?.current);
    // setQRCodeState("normal");
    setPollingTime(5000);
    setPollingTimeNum(0);

    setRefresh(refresh + 1);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
    console.log("data-title:", dataTitle);
  };

  // 获取单价，类型列表
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
        unpaidOrder?.data
      ) {
        setPayTypes(payTypeResponse.data);
        setCommodities(commodityResponse.data.list);
        setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
        setFirstPayRenewedTypes(firstPurchaseResponse.data.first_renewed);

        return {
          commodity: commodityResponse.data.list || [],
        };
      } else {
        eventBus.emit("showModal", { show: true, type: "connectionPay" }); //发现重复订单继续支付
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchPolling = async () => {
    try {
      const response = await payApi.getPolling({
        key: pollingKey,
      });

      if (response.error === 0) {
        const status = response.data?.status;

        setPaymentStatus(status);

        // 支付中
        if (status === 1) {
          setQRCodeState("incoming");
          setPollingTime(3000);
          setPollingTimeNum(0);
        }

        // 没有返回状态，并且是没有超时，支付中的时候进行延时计时判断
        if (!status && status !== 1 && QRCodeState === "normal") {
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

        // if (status === 2) {
        //   let jsonResponse = await loginApi.userInfo();

        //   // 3个参数 用户信息 是否登录 是否显示登录
        //   dispatch(
        //     setAccountInfo(jsonResponse.data.user_info, undefined, undefined)
        //   );

        //   localStorage.setItem(
        //     "token",
        //     JSON.stringify(jsonResponse.data.token)
        //   );
        // }

        if ([2, 3, 4, 5].includes(status) && response.data?.cid) {
          const res = await payApi.getCommodityInfo(response.data?.cid);

          setOrderInfo({ ...res.data, ...response.data });

          if ([3, 4, 5].includes(status)) {
            setShowPopup(null);
            setPayErrorModalOpen(true);
            tracking.trackPurchaseFailure(status);
          }

          if (status === 2) {
            const buy = firstAuth.firstAuth.first_purchase ? 1 : 2;
            const foreground = localStorage.getItem("isBuyFirstVisit");
            const time = localStorage.getItem("firstActiveTime");
            const currentTime = Math.floor(Date.now() / 1000); // 当前时间
            const isTrue =
              !(foreground === "1") && time && currentTime < Number(time);
            const firstVisit = isTrue ? 1 : 0;

            tracking.trackPurchaseSuccess(
              `buy=${buy};firstVisit=${firstVisit};goods=月卡`
            );
            buy === 1
              ? tracking.trackPurchaseFirstBuySuccess()
              : tracking.trackPurchaseFirstShowSuccess();
            localStorage.setItem("isBuyFirstVisit", "1");
            setShowPopup("支付成功");
          }

          setPaymentStatus(status);
        }
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
    }
  };

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
    const inilteFun = async () => {
      const iniliteData = await fetchData();

      if (iniliteData?.commodity?.length > 0) {
        const newKey = guid();

        setQRCodeState("normal");
        setPollingKey(newKey);
        setQrCodeUrl(
          `${env_url}/pay/qrcode?cid=${
            iniliteData?.commodity[activeTabIndex].id
          }&user_id=${userToken}&key=${newKey}&platform=${3}`
        );
      }
    };

    if (userToken && refresh >= 0) {
      inilteFun();
    }
  }, [userToken, refresh]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPolling();
    }, pollingTime);

    intervalIdRef.current = intervalId;

    return () => {
      if (paymentStatus !== 1 || QRCodeState === "timeout") {
        clearInterval(intervalIdRef?.current);
      }
    };
  }, [pollingKey, QRCodeState]);

  useEffect(() => {
    if (
      ([2, 3, 4, 5] as any).includes(paymentStatus) ||
      QRCodeState === "timeout"
    ) {
      clearInterval(intervalIdRef?.current);
    }
  }, [paymentStatus, QRCodeState, refresh]);

  useEffect(() => {
    if (open) {
      const isFirst = firstAuth?.firstAuth?.first_purchase;

      if (isFirst) {
        // 首次购买埋点
        tracking.trackPurchaseFirstBuy();
      } else {
        // 首次续费埋点
        tracking.trackPurchaseFirstShow();
      }
    }
  }, [open]);

  return (
    <Fragment>
      <Modal
        wrapClassName="pay-wrap-module"
        className="pay-module pay-module-new"
        open={open}
        onCancel={() => {
          iniliteReset();
          dispatch(setFirstPayRP({ open: false, type: "" }));
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
          <div
            className="close-icon"
            onClick={() => {
              iniliteReset();
              dispatch(setFirstPayRP({ open: false, type: "" }));
            }}
          >
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
                      {QRCodeState === "incoming" && "如遇问题"}
                      <span onClick={() => iniliteReset()}>点击刷新</span>
                    </div>
                    <div>
                      {QRCodeState === "timeout" && "二维码"}
                      {QRCodeState === "incoming" && "二维码重试"}
                    </div>
                  </div>
                )}
              </div>
            )}
            {commodities?.[activeTabIndex] ? (
              <div className="first-carousel">
                <div className="carousel-price">
                  <span className="text">扫码支付：</span>
                  <span className="icon">¥</span>
                  <span className="price">
                    {commodities?.[activeTabIndex]?.price}
                  </span>
                </div>
                <div className="carousel-text">请使用[微信/支付宝]扫码</div>
                <div
                  className="user-text"
                  onClick={handleClick}
                  ref={divRef}
                  data-title="https://cdn.accessorx.com/web/terms_of_service.html"
                >
                  用户协议
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
      <PaymentModal
        open={!!showPopup}
        info={orderInfo}
        setOpen={(e) => {
          iniliteReset();
          dispatch(setFirstPayRP({ open: false, type: "" }));
          setShowPopup(e);
        }}
      />
      {payErrorModalOpen ? (
        <PayErrorModal
          accelOpen={payErrorModalOpen}
          setAccelOpen={(e) => {
            setQRCodeState("normal");
            iniliteReset();
            setPayErrorModalOpen(e);
          }}
          onConfirm={() => {
            setQRCodeState("normal");
            iniliteReset();
            setPayErrorModalOpen(false);
          }}
        />
      ) : null}
    </Fragment>
  );
};

export default PayModal;
