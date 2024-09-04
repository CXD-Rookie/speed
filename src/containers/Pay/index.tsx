import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";

import tracking from "@/common/tracking";
import eventBus from '../../api/eventBus'; 
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

interface ImageItem {
  image_url: string;
  params: any;
}

const PayModal: React.FC<PayModalProps> = (props) => {
  const { isModalOpen, setIsModalOpen = () => {} } = props;

  const intervalIdRef: any = useRef(null); // 用于存储interval的引用
  const dispatch: any = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({});
  const [firstPayTypes, setFirstPayTypes] = useState<{ [key: string]: string }>(
    {}
  );
  const [firstPayRenewedTypes, setFirstPayRenewedTypes] = useState<{
    [key: string]: string;
  }>({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [userToken, setUserToken] = useState(accountInfo.userInfo.id);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  const [payErrorModalOpen, setPayErrorModalOpen] = useState(false);
  const [firstPurchase, setFirstPurchase] = useState(false);
  const [firstRenewal, setFirstRenewal] = useState(false);
  const [isOldUser, setIsOldUser] = useState(false);
  const [connectionPayOpen, setConnectionPayOpen] = useState(false); // 当前是否有订单处理中弹窗

  const [pollingTime, setPollingTime] = useState(5000); // 轮询支付接口的时间
  const [QRCodeState, setQRCodeState] = useState("normal"); // 二维码状态 normal 正常 incoming 支付中 timeout 超时
  const [, setPollingTimeNum] = useState(0); // 轮询支付接口时长
  const [refresh, setRefresh] = useState(0); // 控制是否属性页面重新请求

  const [arrow, setArrow] = useState(0); // 移动的位置
  const [images, setImages] = useState<ImageItem[]>([]);
  
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
    setRefresh(refresh + 1);
    setQRCodeState("normal");
    setPollingTime(5000);
    setPollingTimeNum(0);
  }

  const updateActiveTabIndex = (index: number) => {
    if (QRCodeState === "timeout") {
      iniliteReset();
    }

    setActiveTabIndex(index);
  };

  const divRef = useRef<HTMLDivElement>(null);

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
        setPayTypes(payTypeResponse?.data);
        setCommodities(commodityResponse?.data?.list);

        const { first_purchase, first_renewed } = firstAuth?.firstAuth;

        if (!first_purchase && !first_renewed) {
          setIsOldUser(true); //正式
        } else if (first_purchase && !first_renewed) {
          setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
          setFirstPurchase(true);
        } else if (!first_purchase && first_renewed) {
          setFirstPayRenewedTypes(firstPurchaseResponse.data.first_renewed);
          setFirstRenewal(true);
        }

        return {
          commodity: commodityResponse.data.list || [],
        };
      } else {
        setConnectionPayOpen(true); //发现重复订单继续支付
      }

      // return 
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
          setPollingTimeNum(0)
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
          }

          if (status === 2) {
            setShowPopup("支付成功");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
    }
  }

  useEffect(() => {
    // 初始化时从 localStorage 读取banner数据
    const storedData = JSON.parse(localStorage.getItem("all_data") || "[]");
    setImages(storedData);

    // 监听 eventBus 的 'dataUpdated' 事件
    const handleDataUpdated = (newData: ImageItem[]) => {
      setImages(newData);
    };

    eventBus.on("dataUpdated", handleDataUpdated);

    // 清理工作
    return () => {
      eventBus.off("dataUpdated", handleDataUpdated);
    };
  }, []);

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

        tracking.trackPurchasePageShow();

        setPollingKey(newKey);
        setQrCodeUrl(
          `${env_url}/pay/qrcode?cid=${
            iniliteData?.commodity[activeTabIndex].id
          }&user_id=${userToken}&key=${newKey}&platform=${3}`
        );
      }
    }

    if (userToken && refresh >= 0) {
      console.log(111);
      
      inilteFun();
    }
  }, [userToken, refresh]);

  useEffect(() => {
    console.log(QRCodeState, paymentStatus);
    
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

  return (
    <Fragment>
      <Modal
        className="pay-module"
        open={isModalOpen}
        onCancel={() => {
          iniliteReset();
          setIsModalOpen(false);
        }}
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
                  {images?.length > 0 &&
                    (firstAuth.firstAuth.first_purchase ||
                      firstAuth.firstAuth.first_renewed) && (
                      <div className={`${isOldUser ? "" : "discount"}`}>
                        {!firstAuth.firstAuth.first_purchase &&
                          `续费${
                            Number(firstPayRenewedTypes[item.type]) / 10
                          }折`}
                        {!firstAuth.firstAuth.first_renewed &&
                          `首充${Number(firstPayTypes[item.type]) / 10}折`}
                      </div>
                    )}

                  <div className="term">{item.name}</div>
                  <div className="price">
                    ¥<span className="price-text">{item.month_price}</span>/月
                    {images?.length > 0 &&
                      (firstAuth.firstAuth.first_purchase ||
                        firstAuth.firstAuth.first_renewed) && (
                        <span className="text">
                          ¥{item.scribing_month_price}
                        </span>
                      )}
                  </div>
                  <div className="amount">
                    总价：¥<span>{item.price}</span>
                    {images?.length > 0 &&
                      (firstAuth.firstAuth.first_purchase ||
                        firstAuth.firstAuth.first_renewed) && (
                        <span className="text">
                          原价: ¥{item.scribing_price}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="line"></div>
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
          iniliteReset();
          setIsModalOpen(false);
          setShowPopup(e);
        }}
      />
      {payErrorModalOpen ? (
        <PayErrorModal
          accelOpen={payErrorModalOpen}
          setAccelOpen={(e) => {
            // updateQrCode();
            iniliteReset();
            setPayErrorModalOpen(e);
          }}
          onConfirm={() => {
            // updateQrCode();
            iniliteReset();
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
