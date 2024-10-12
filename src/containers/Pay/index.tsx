import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { validityPeriod } from "../currency-exchange/utils";
import { nodeDebounce } from "@/common/utils";

import "./index.scss";
import tracking from "@/common/tracking";
import eventBus from '../../api/eventBus'; 
import PayErrorModal from "../pay-error";
import TooltipCom from "./tooltip";
import payApi from "@/api/pay";
import PaymentModal from "../payment";

import loadingGif from '@/assets/images/common/jiazai.gif';

interface PayModalProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (e: any) => void;
  couponValue?: any;
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
  const { isModalOpen, setIsModalOpen = () => {}, couponValue = {} } = props;

  const divRef = useRef<HTMLDivElement>(null); // 协议地址绑定引用ref
  const intervalIdRef: any = useRef(null); // 用于存储轮询计时器interval的引用

  const firstAuth = useSelector((state: any) => state.firstAuth); // 第一次优惠信息
  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  const userToken = accountInfo.userInfo.id; // 用户token
  const env_url = process.env.REACT_APP_API_URL;

  const [showPopup, setShowPopup] = useState<string | null>(null); // 控制支付订单状态提示是否显示
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null); // 支付订单信息
  const [payErrorModalOpen, setPayErrorModalOpen] = useState(false); // 控制支付订单错误弹窗是否显示

  const [images, setImages] = useState<ImageItem[]>([]); // 存储是否有会员首充和会员折扣信息
  const [purchaseState, setPurchaseState] = useState<string>("none"); // 首充首续状态 none 都没有 purchase 首充 renewed 首续
  const [purchaseTypes, setPurchaseTypes] = useState<any>({}); // 首充首续折扣信息

  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({}); // 商品支付类型
  const [commodities, setCommodities] = useState<Commodity[]>([]); // 商品信息
  const [couponOpen, setCouponOpen] = useState(false); // 是否展开优惠券
  const [couponData, setCouponData] = useState([]); // 优惠券列表信息

  const [activeCoupon, setActiveCoupon] = useState<any>(couponValue); // 选中优惠券信息

  const [qrCodeUrl, setQrCodeUrl] = useState(""); // 二维码cdn地址
  const [QRCodeLoading, setQRCodeLoading] = useState(false); // 二维码是否加载中
  const [QRCodeState, setQRCodeState] = useState("normal"); // 二维码状态 normal 正常 incoming 支付中 timeout 超时 spining 生成中
  const [pollingKey, setPollingKey] = useState<string>(""); // 生成二维码的规则key
  const [pollingTime, setPollingTime] = useState(5000); // 轮询支付接口的时间
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null); // 订单支付状态
  const [, setPollingTimeNum] = useState(0); // 轮询计时器当前累计时长

  const [iniliteLoading, setIniliteLoading] = useState(false); // 全局加载动画判断值
  const [arrow, setArrow] = useState(0); // 商品列表左右箭头移动的位置
  const [refresh, setRefresh] = useState(0); // 控制页面是否重新请求
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 选中商品索引

  // 计算折扣
  const isInteger = (value: number | string) => {
    const num = Number(value);
    return Number.isInteger(num / 10) ? num / 10 : num;
  };

  // 根据规则随机生成的guid
  const randomlyGenerateGuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // 根据选中商品，guid，优惠折扣生成的二维码cdn地址
  const autoGenerateQRCodes = (event: any = {}) => {
    return `${env_url}/pay/qrcode?cid=${event?.cid}&user_id=${userToken}&key=${
      event?.key
    }&platform=${3}&rid=${activeCoupon?.rid || ""}`;
  };

  // 更新二维码，更新规则key，更新guid
  const updateQRCodesInfo = (code: any) => {
    const randomKey = randomlyGenerateGuid(); // 根据规则随机生成的guid
    const qRCodes = autoGenerateQRCodes({
      cid: code?.cid,
      key: randomKey,
    }); // 生成的二维码地址

    tracking.trackPurchasePageShow();
    setPollingKey(randomKey); // 存储当前二维码的规则key
    setQrCodeUrl(qRCodes); // 存储二维码地址
  };

  // 找到 content 值最小的数据项，并且在有多个相同最小值时选择索引最小的项
  const findMinIndex = (data: any = []) => {
    let minContent = Infinity;
    let minIndex = -1;
    let minItem = null;

    for (let i = 0; i < data.length; i++) {
      const currentItem = data[i];
      const currentContent = currentItem.redeem_code.content;

      if (
        currentContent < minContent ||
        (currentContent === minContent && i < minIndex)
      ) {
        minContent = currentContent;
        minIndex = i;
        minItem = currentItem;
      }
    }

    return minItem;
  }

  // 点击协议进行链接跳转到浏览器
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
  };

  // 点击手动刷新函数
  const iniliteReset = () => {
    clearInterval(intervalIdRef?.current);
    setPollingTime(5000); // 还原轮询时间间隔
    setPollingTimeNum(0); // 清空轮询计时器当前累计时长
    setQRCodeState("normal"); // 重置二维码状态
    setRefresh(refresh + 1);
  };

  // 点击关闭按钮函数
  const onCancel = () => {
    setQRCodeState("normal"); // 重置二维码状态
    setPollingTime(5000); // 还原轮询时间间隔
    setPollingTimeNum(0); // 清空轮询计时器当前累计时长
    setPollingKey(""); // 清空二维码的key
    setPaymentStatus(null); // 重置支付订单状态
    setRefresh(0); // 重置控制页面是否重新请求次数
    clearInterval(intervalIdRef?.current); // 清除轮询计时器
    setActiveTabIndex(0); // 还原选中选中商品索引
    setIsModalOpen(false); // 关闭会员充值页面
  };

  // 切换选中商品时
  const updateActiveTabIndex = (index: number) => {
    // 如果商品在支付中保持轮询不变
    if (QRCodeState !== "incoming") {
      setQRCodeLoading(true);
      clearInterval(intervalIdRef?.current);
      setQRCodeState("normal"); // 重置二维码状态
      setPollingTime(5000); // 还原轮询时间间隔
      setPollingTimeNum(0); // 清空轮询计时器当前累计时长
      // 生成二维码信息
      updateQRCodesInfo({
        cid: commodities?.[activeTabIndex].id,
      });

      setQRCodeLoading(false);
    }

    setActiveTabIndex(index);
  };

  // 数据请求
  const fetchInilite = async () => {
    try {
      setIniliteLoading(true); // 开启全局加载动画

      let payType: any = {}; // 商品支付类型
      let firstPurchase: any = {}; // 首次购买和首次续费的折扣

      // 如果是第一次初始化请求, 执行只需要第一次执行的api
      if (refresh === 0) {
        const [payTypeRes, firstPurchaseRes] = await Promise.all([
          payApi.getPayTypeList(), // 商品支付类型api
          payApi.getfirst_purchase_renewed_discount(), // 首次购买和首次续费的折扣api
        ]);

        if (payTypeRes?.error === 0 && firstPurchaseRes?.error === 0) {
          payType = payTypeRes?.data || {};
          firstPurchase = firstPurchaseRes?.data || {};

          setPayTypes(payType);

          // 首次充值 首充续购
          const { first_purchase, first_renewed } = firstAuth?.firstAuth;

          // 没有首充首续
          // 只有首续
          // 只有首充
          if (!first_purchase && !first_renewed) {
            setPurchaseState("none"); // 更新首充首续状态
            setPurchaseTypes({}); // 更新首充首续折扣
          } else if (first_purchase && !first_renewed) {
            setPurchaseState("purchase");
            setPurchaseTypes(firstPurchase?.first_purchase || {});
          } else if (!first_purchase && first_renewed) {
            setPurchaseState("renewed");
            setPurchaseTypes(firstPurchase?.first_renewed || {});
          }
        }
      }

      const [commodityRes, makeCouponRes] = await Promise.all([
        payApi.getCommodityList({ rid: activeCoupon?.rid }),
        payApi.redeemList({ type: 2, status: 1, page: 1, pagesize: 100 }),
      ]);

      if (commodityRes?.error === 0 && makeCouponRes?.error === 0) {
        setCommodities(commodityRes?.data?.list || []);
        setCouponData(makeCouponRes?.data?.list || []);
      }

      return commodityRes?.data?.list || [];
    } catch (error) {
      console.log("error", error);
    } finally {
      setIniliteLoading(false); // 关闭全局加载动画
    }
  };

  // 轮询接口，不断获取支付状态
  const fetchPolling = async () => {
    try {
      // 轮询接口
      const res = await payApi.getPolling({
        key: pollingKey,
      });

      if (res?.error === 0) {
        const status = res?.data?.status; // 订单状态

        setPaymentStatus(status); // 更新订单状态

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

        // 2已支付 3支付失败 4手动取消 5超时取消
        if ([2, 3, 4, 5].includes(status) && res?.data?.cid) {
          const commodityRes = await payApi.getCommodityInfo(res.data?.cid);

          setOrderInfo({ ...commodityRes.data, ...res.data });

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
      console.log("error", error);
    }
  };

  useEffect(() => {
    // 初始化在没有别的页面点击立即使用优惠卡进入到支付页面的时候，默认选中折扣最小的，索引值靠前的数据进行默认选中折扣卡
    // 优惠券列表不为空
    if (
      !(Object.keys(couponValue)?.length > 0) &&
      couponData?.length > 0 &&
      !activeCoupon?.id
    ) {
      // 找出优惠券中折扣最小的，同时索引是数据里边最靠前的
      const data = findMinIndex(couponData);
      setActiveCoupon(data);
    }
  }, [couponData]);

  // 在初始化，token改变，进行刷新refresh，别的页面携带优惠券activeCoupon进入时触发逻辑刷新逻辑
  useEffect(() => {
    const inilteFun = async () => {
      const iniliteData = await fetchInilite(); // 请求数据

      if (iniliteData?.length > 0) {
        // 生成二维码信息
        updateQRCodesInfo({
          cid: iniliteData?.[activeTabIndex].id,
        });
      }
    };

    if (userToken && refresh >= 0) {
      inilteFun();
    }
  }, [userToken, refresh, activeCoupon]);

  useEffect(() => {
    if (pollingKey) {
      const intervalId = setInterval(() => {
        fetchPolling();
      }, pollingTime);

      intervalIdRef.current = intervalId;
    }

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

  // 初始化只执行一次
  useEffect(() => {
    // 监听 eventBus 的 'dataUpdated' 事件
    const handleDataUpdated = (newData: ImageItem[]) => {
      setImages(newData);
    };
    // 初始化时从 localStorage 读取banner数据
    const storedData = JSON.parse(localStorage.getItem("all_data") || "[]");

    setImages(storedData);
    eventBus.on("dataUpdated", handleDataUpdated);

    // 清理工作
    return () => {
      eventBus.off("dataUpdated", handleDataUpdated);
    };
  }, []);

  return (
    <Fragment>
      <Modal
        className="pay-module"
        title={"会员充值"}
        width={"67.6vw"}
        open={isModalOpen}
        onCancel={onCancel}
        destroyOnClose
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
          {iniliteLoading ? (
            // 全局加载动画
            <img className="pay-loading-img" src={loadingGif} alt="" />
          ) : (
            <div className="tabs-container">
              {/* 商品列表左右按钮 */}
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
              {/* 商品列表 */}
              <div className="tabs">
                {commodities.map((item, index) => {
                  // 是否首充或者首续存在
                  const isPurchase =
                    images?.length > 0 &&
                    ["purchase", "renewed"].includes(purchaseState);

                  return (
                    <div
                      key={index}
                      className={`tab ${
                        index === activeTabIndex ? "active" : ""
                      }`}
                      style={{ transform: `translateX(${arrow * 15.25}vw)` }}
                      onClick={() => updateActiveTabIndex(index)}
                    >
                      {/* 优惠券或者首充首续的折扣 */}
                      {activeCoupon?.id ? (
                        <div className="discount">
                          {activeCoupon?.redeem_code?.content}折
                        </div>
                      ) : isPurchase ? (
                        <div
                          className={`${
                            purchaseState === "none" ? "" : "discount"
                          }`}
                        >
                          {purchaseState === "purchase"
                            ? `首充${isInteger(purchaseTypes[item.type])}`
                            : `续费${isInteger(purchaseTypes[item.type])}`}
                          折
                        </div>
                      ) : null}
                      <div className="term">{item.name}</div>
                      <div className="price">
                        ¥<span className="price-text">{item.month_price}</span>
                        /月
                        {(activeCoupon?.id || isPurchase) && (
                          <span className="text">
                            ¥{item.scribing_month_price}
                          </span>
                        )}
                      </div>
                      <div className="amount">
                        总价：¥<span>{item.price}</span>
                        {(activeCoupon?.id || isPurchase) && (
                          <span className="text">
                            原价: ¥{item.scribing_price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 支付和优惠券区域 */}
              <div className="content">
                {/* 二维码区域 */}
                {qrCodeUrl && (
                  <div className="qrcode">
                    <img className="header-icon" src={qrCodeUrl} alt="" />
                    {QRCodeState !== "normal" && !QRCodeLoading && (
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
                    {QRCodeLoading && (
                      <div className="QR-loading-mask">
                        <img
                          className="qrcode-loading-img"
                          src={loadingGif}
                          alt=""
                        />
                      </div>
                    )}
                  </div>
                )}
                {/* 支付金额，协议区域 */}
                {commodities?.[activeTabIndex] ? (
                  <div className="carousel">
                    <div className="carousel-title">支付宝或微信扫码支付</div>
                    <div className="carousel-price">
                      {commodities?.[activeTabIndex]?.price}
                      <span>元</span>
                    </div>
                    <div className="carousel-agreement">
                      我已同意《
                      <span
                        className="txt"
                        ref={divRef}
                        onClick={handleClick}
                        data-title="https://cdn.accessorx.com/web/terms_of_service.html"
                      >
                        用户协议
                      </span>
                      》及《
                      <span
                        className="txt"
                        ref={divRef}
                        onClick={handleClick}
                        data-title="https://cdn.accessorx.com/web/automatic_renewal_agreement.html"
                      >
                        自动续费协议
                      </span>
                      》到期按每月29元自动续费，可随时取消 <TooltipCom />
                    </div>
                  </div>
                ) : null}
                <div className="my-coupons">
                  <div className="title">我的优惠券： </div>
                  <div className="coupons">
                    <div
                      className={`custom-input ${
                        couponData?.length > 0 && activeCoupon?.id
                          ? "hit-custom-input"
                          : ""
                      }`}
                      onClick={() => {
                        if (couponData?.length > 0) {
                          setCouponOpen(!couponOpen);
                        }
                      }}
                    >
                      {couponData?.length < 1 ? (
                        <span>暂无可用优惠券</span>
                      ) : activeCoupon?.id ? (
                        <span
                          className={`${
                            activeCoupon?.id ? "hit-custom-input" : ""
                          }`}
                        >
                          已选择：{activeCoupon?.redeem_code?.name}
                        </span>
                      ) : (
                        <span>您有{couponData?.length}张优惠券可使用</span>
                      )}
                      <div
                        className={
                          couponOpen ? "triangles-bottom" : "triangles-top"
                        }
                      />
                    </div>
                    {couponOpen && (
                      <div className="custom-down">
                        {couponData.map((item: any) => {
                          return (
                            <div
                              className="mask-card card"
                              key={item?.id}
                              onClick={nodeDebounce(() => {
                                setActiveCoupon(
                                  activeCoupon?.id === item?.id ? {} : item
                                );
                                iniliteReset()
                              }, 100)}
                            >
                              <div className="icon-box">
                                <div className="left" />
                                <div className="right" />
                                {item?.redeem_code?.content}折
                              </div>
                              <div className="text-box">
                                <div className="title">
                                  {item?.redeem_code?.name}
                                </div>
                                <div
                                  className="time-box"
                                  style={
                                    validityPeriod(item).indexOf("过期") === -1
                                      ? { color: "#999" }
                                      : {}
                                  }
                                >
                                  {validityPeriod(item, "state")}
                                </div>
                              </div>
                              <div
                                className={`custom-radio ${
                                  activeCoupon?.id === item?.id
                                    ? "active-custom-radio"
                                    : ""
                                }`}
                              >
                                <div className="radio-after" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      {/* 订单支付成功页面 */}
      <PaymentModal
        open={!!showPopup}
        info={orderInfo}
        payTypes={payTypes}
        setOpen={(e) => {
          onCancel();
          setShowPopup(e);
        }}
      />
      {/* 订单支付失败 */}
      {payErrorModalOpen ? (
        <PayErrorModal
          accelOpen={payErrorModalOpen}
          setAccelOpen={(e) => {
            onCancel();
            setPayErrorModalOpen(e);
          }}
          onConfirm={() => {
            onCancel();
            setPayErrorModalOpen(false);
          }}
        />
      ) : null}
    </Fragment>
  );
};

export default PayModal;
