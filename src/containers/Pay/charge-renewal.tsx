import React, { useState, useEffect, useRef, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFirstPayRP } from "@/redux/actions/modal-open";
import { validateRequiredParams } from "@/common/utils";

import "./charge-renewal.scss";

import PayErrorModal from "../pay-error";
import PaymentModal from "../payment";
import payApi from "@/api/pay";
import eventBus from "@/api/eventBus";
import tracking from "@/common/tracking";

import closeIcon from "@/assets/images/common/cloture.svg";

import cMonthIcon from "@/assets/images/pay/charge/month.webp";
import cMonthHoverIcon from "@/assets/images/pay/charge/month-hover.webp";
import cQuarterIcon from "@/assets/images/pay/charge/quarter.webp";
import cQuarterHoverIcon from "@/assets/images/pay/charge/quarter-hover.webp";
import cHalfIcon from "@/assets/images/pay/charge/half.webp";
import cHalfHoverIcon from "@/assets/images/pay/charge/half-hover.webp";
import cYearIcon from "@/assets/images/pay/charge/year.webp";
import cYearHoverIcon from "@/assets/images/pay/charge/year-hover.webp";

import rMonthIcon from "@/assets/images/pay/renewal/month.webp";
import rMonthHoverIcon from "@/assets/images/pay/renewal/month-hover.webp";
import rQuarterIcon from "@/assets/images/pay/renewal/quarter.webp";
import rQuarterHoverIcon from "@/assets/images/pay/renewal/quarter-hover.webp";
import rHalfIcon from "@/assets/images/pay/renewal/half.webp";
import rHalfHoverIcon from "@/assets/images/pay/renewal/half-hover.webp";
import rYearIcon from "@/assets/images/pay/renewal/year.webp";
import rYearHoverIcon from "@/assets/images/pay/renewal/year-hover.webp";

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

const modalUrl: any = {
  2: "charge-pay-module",
  3: "renewal-pay-module",
};

const commodTypeMap: any = {
  2: {
    1: {
      src: cMonthIcon,
      hover_src: cMonthHoverIcon,
    },
    2: {
      src: cQuarterIcon,
      hover_src: cQuarterHoverIcon,
    },
    3: {
      src: cHalfIcon,
      hover_src: cHalfHoverIcon,
    },
    4: {
      src: cYearIcon,
      hover_src: cYearHoverIcon,
    },
  },
  3: {
    1: {
      src: rMonthIcon,
      hover_src: rMonthHoverIcon,
    },
    2: {
      src: rQuarterIcon,
      hover_src: rQuarterHoverIcon,
    },
    3: {
      src: rHalfIcon,
      hover_src: rHalfHoverIcon,
    },
    4: {
      src: rYearIcon,
      hover_src: rYearHoverIcon,
    },
  },
};

const ChargeRenewal: React.FC = (props) => {
  const dispatch: any = useDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const intervalIdRef: any = useRef(null); // 用于存储interval的引用

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const { open = false, type = "" } = useSelector(
    (state: any) => state?.modalOpen?.firstPayRP
  );

  const [commodities, setCommodities] = useState<any>([]);
  const [hitCommod, setHitCommod] = useState<any>({}); // 选中的商品类型
  const [hoverCommod, setHoverCommod] = useState({
    is_hover: false,
    type: "",
  }); // 是否经过
  const [, setPayTypes] = useState<any>({});

  const [activeTabIndex, setActiveTabIndex] = useState(0);
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

  // 根据规则随机生成的guid
  const randomlyGenerateGuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const iniliteReset = () => {
    clearInterval(intervalIdRef?.current);
    setPollingTime(5000);
    setPollingTimeNum(0);
    setRefresh(refresh + 1);
  };

  // 根据选中商品，guid，优惠折扣生成的二维码cdn地址
  const autoGenerateQRCodes = (event: any = {}) => {
    return `${env_url}/pay/qrcode?cid=${event?.cid}&user_id=${userToken}&key=${
      event?.key
    }&platform=${3}&mchannel=${localStorage.getItem(
      "mchannel"
    )}&adid=${localStorage.getItem("adid")}`;
  };

  // 更新二维码，更新规则key，更新guid
  const updateQRCodesInfo = (code: any) => {
    const randomKey = randomlyGenerateGuid(); // 根据规则随机生成的guid
    const qRCodes = autoGenerateQRCodes({
      cid: code?.cid,
      key: randomKey,
    }); // 生成的二维码地址

    setPollingKey(randomKey); // 存储当前二维码的规则key
    setQrCodeUrl(qRCodes); // 存储二维码地址
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
  };

  // 获取单价，类型列表
  const fetchData = async () => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      const [payTypeResponse, commodityResponse, unpaidOrder] =
        await Promise.all([
          payApi.getPayTypeList(),
          payApi.getCommodityList(),
          payApi.UnpaidOrder(),
        ]);

      if (
        payTypeResponse.error === 0 &&
        commodityResponse.error === 0 &&
        unpaidOrder?.data
      ) {
        const data = [...(commodityResponse?.data?.list || [])].reverse();

        setPayTypes(payTypeResponse.data);
        setCommodities([...data]);
        setHitCommod(data?.[activeTabIndex]);

        return {
          commodity: data,
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
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

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

        if ([2, 3, 4, 5].includes(status) && response.data?.cid) {
          const reqire = await validateRequiredParams({
            cid: response.data?.cid,
          });

          if (!reqire) {
            return;
          }

          const res = await payApi.getCommodityInfo(response.data?.cid);

          setOrderInfo({ ...res.data, ...response.data });

          if ([3, 4, 5].includes(status)) {
            setShowPopup(null);
            setPayErrorModalOpen(true);
            tracking.trackPurchaseFailure(status);
          }

          if (status === 2) {
            const buy = firstAuth.firstAuth.first_purchase ? 1 : 2;
            const time = localStorage.getItem("firstActiveTime");
            const currentTime = Math.floor(Date.now() / 1000); // 当前时间
            const isTrue = time && currentTime < Number(time);
            const firstVisit = isTrue ? 1 : 0;
            const goods = res?.data?.name;

            tracking.trackPurchaseSuccess(
              `buy=${buy};firstDay=${firstVisit};goods=${goods}`
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
      const iniliteData: any = await fetchData();

      if (iniliteData?.commodity?.length > 0) {
        // 生成二维码信息
        updateQRCodesInfo({
          cid: iniliteData?.commodity[activeTabIndex].id,
        });
        setQRCodeState("normal");
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

  return open ? (
    <Fragment>
      <div className={`charge-renewal-module ${modalUrl?.[type]}`}>
        <div>
          <div
            className="activity-close-icon"
            onClick={() => {
              iniliteReset();
              dispatch(setFirstPayRP({ open: false, type: "" }));
            }}
          >
            <img src={closeIcon} alt="" />
          </div>
          <div className="main">
            <div
              className="activity-box"
              style={{ marginTop: String(type) === "2" ? "31vh" : "34vh" }}
            >
              {commodities?.length > 0 &&
                commodities?.map((item: any, index: number) => {
                  return (
                    <div
                      className={`activity-img-box ${
                        String(type) === "3"
                          ? hitCommod?.type === item?.type
                            ? "activity-img-box-active"
                            : "activity-img-box-normal"
                          : "null"
                      }`}
                      key={item?.type}
                    >
                      <img
                        className={
                          String(type) === "3" ? "renewal-img" : "charge-img"
                        }
                        src={
                          commodTypeMap?.[type]?.[item?.type]?.[
                            (hoverCommod?.is_hover &&
                              hoverCommod?.type === item?.type) ||
                            hitCommod?.type === item?.type
                              ? "hover_src"
                              : "src"
                          ]
                        }
                        alt=""
                        onClick={() => {
                          setHitCommod(item);
                          setActiveTabIndex(index);

                          // 如果商品在支付中保持轮询不变
                          if (QRCodeState !== "incoming") {
                            setQrCodeUrl(""); // 存储二维码地址
                            clearInterval(intervalIdRef?.current);
                            setQRCodeState("normal"); // 重置二维码状态
                            setPollingTimeNum(0); // 清空轮询计时器当前累计时长

                            // 生成二维码信息
                            updateQRCodesInfo({
                              cid: item?.id,
                            });
                          }
                        }}
                        onMouseMove={() =>
                          setHoverCommod({
                            is_hover: true,
                            type: item?.type,
                          })
                        }
                        onMouseLeave={() =>
                          setHoverCommod({
                            is_hover: false,
                            type: "",
                          })
                        }
                      />
                    </div>
                  );
                })}
            </div>
            <div className="activity-footer">
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
                    <span className="price">{hitCommod?.price}</span>
                  </div>
                  <div className="carousel-text">请使用[微信/支付宝]扫码</div>
                  <div
                    className="user-text"
                    onClick={handleClick}
                    ref={divRef}
                    data-title={process.env.REACT_APP_TERMS_ADDRESS}
                  >
                    用户协议
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
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
  ) : null;
};

export default ChargeRenewal;
