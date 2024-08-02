import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import tracking from "@/common/tracking";
import "./index.scss";
import "./new.scss";
import eventBus from "@/api/eventBus";
import PayErrorModal from "../pay-error";
import TooltipCom from "./tooltip";
import payApi from "@/api/pay";
import loginApi from "@/api/login";
import PaymentModal from "../payment";

interface PayModalProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (e: any) => void;
  type:any;
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
  const { type } = props;
  const dispatch: any = useDispatch();
  //@ts-ignore
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const firstAuth = useSelector((state: any) => state.firstAuth);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({});
  const [firstPayTypes, setFirstPayTypes] = useState<{ [key: string]: string }>({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  //@ts-ignore
  const [userToken, setUserToken] = useState(accountInfo.userInfo.id);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  const [payErrorModalOpen, setPayErrorModalOpen] = useState(false);

  // const isPayOpen = useSelector((state: any) => state.auth.isPayOpen);
  // const dispatch = useDispatch();

  // const handleClose = () => {
  //   dispatch(closePayModal());
  // };

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
        const [payTypeResponse, commodityResponse, firstPurchaseResponse, unpaidOrder] = await Promise.all([
          payApi.getPayTypeList(),
          payApi.getCommodityList(),
          payApi.getfirst_purchase_renewed_discount(),
          payApi.UnpaidOrder(),
        ]);

        if (payTypeResponse.error === 0 && commodityResponse.error === 0 && (unpaidOrder.data != null || unpaidOrder.data != '' || unpaidOrder.data != undefined)) {
          setPayTypes(payTypeResponse.data);
          setCommodities(commodityResponse.data.list);
          setFirstPayTypes(firstPurchaseResponse.data.first_purchase);
          // Fetch the initial QR code URL based on the first commodity
          if (commodityResponse.data.list.length > 0) {
            const newKey = guid();
            setPollingKey(newKey);
            setQrCodeUrl(
              `https://test-api.accessorx.com/api/v1/pay/qrcode?cid=${commodityResponse.data.list[0].id}&user_id=${userToken}&key=${newKey}`
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
          `https://test-api.accessorx.com/api/v1/pay/qrcode?cid=${commodities[activeTabIndex].id}&user_id=${userToken}&key=${newKey}`
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


 useEffect(() => {
    console.log(firstAuth,'是否新用户充值信息--------------')
 }, [firstAuth])

  return (
    <Fragment>
      <Modal
        className="pay-module pay-module-new"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title=""
        destroyOnClose
        width={"67.6vw"}
        centered
        maskClosable={false}
        footer={null}
      >
        <div className="pay-modal">
          <div className={type === 2 ? 'new-design' : type === 3 ? 'new-design2' : ''}>
            <div className="newMain">
              <div className="carousel">
              {commodities.map((item, index) => (
                <div
                  key={index}
                  className="carousel-item dl"
                  style={{ display: index === activeTabIndex ? "block" : "none" }}
                >
                  <p className="highlight">月卡{Number(firstPayTypes[item.type]) / 10}折</p>
                  <div className="priceAllNew" data-price={item.price}>
                    <ul>
                      <li>
                        ￥<span className="priceBigNew">{item.price}</span>/月
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
              </div>
              <h6>原价：￥25</h6>
            </div>
          </div>
          <div className="main">
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
                      </div>》
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
