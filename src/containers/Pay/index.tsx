import React, { useState, useEffect, useRef, Fragment } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { validityPeriod } from "../currency-exchange/utils";
import { nodeDebounce } from "@/common/utils";

import tracking from "@/common/tracking";
import eventBus from '../../api/eventBus'; 
import "./index.scss";
import PayErrorModal from "../pay-error";
import TooltipCom from "./tooltip";
import payApi from "@/api/pay";
import PaymentModal from "../payment";
import BreakConfirmModal from "../break-confirm";

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

  const firstAuth = useSelector((state: any) => state.firstAuth); // 第一次优惠信息
  const accountInfo: any = useSelector((state: any) => state.accountInfo); // 用户信息
  const userToken = accountInfo.userInfo.id; // 用户token
  const env_url = process.env.REACT_APP_API_URL;

  const [images, setImages] = useState<ImageItem[]>([]); // 存储是否有会员首充和会员折扣信息
  const [purchaseState, setPurchaseState] = useState<string>("none"); // 首充首续状态 none 都没有 purchase 首充 renewed 首续
  const [purchaseTypes, setPurchaseTypes] = useState<any>({}); // 首充首续折扣信息

  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({}); // 商品支付类型
  const [commodities, setCommodities] = useState<Commodity[]>([]); // 商品信息
  const [couponData, setCouponData] = useState([]); // 优惠券列表信息

  const [activeCoupon, setActiveCoupon] = useState<any>(couponValue); // 选中优惠券信息

  const [qrCodeUrl, setQrCodeUrl] = useState(""); // 二维码cdn地址
  const [QRCodeState, setQRCodeState] = useState("normal"); // 二维码状态 normal 正常 incoming 支付中 timeout 超时 spining 生成中
  const [pollingKey, setPollingKey] = useState<string>(""); // 生成二维码的规则key

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

  // 点击关闭按钮函数
  const onCancel = () => {
    setIsModalOpen(false); // 关闭会员充值页面
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

  // 在初始化，token改变，进行刷新refresh，别的页面携带优惠券activeCoupon进入时触发逻辑刷新逻辑
  useEffect(() => {
    const inilteFun = async () => {
      const iniliteData = await fetchInilite(); // 请求数据

      if (iniliteData?.length > 0) {
        // 生成二维码信息
        updateQRCodesInfo({
          cid: iniliteData?.[activeTabIndex].id
        });
      }
    };

    if (userToken && refresh >= 0) {
      inilteFun();
    }
  }, [userToken, refresh, activeCoupon]);

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
                      // onClick={() => updateActiveTabIndex(index)}
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
                          {/* <span onClick={() => iniliteReset()}>点击刷新</span> */}
                        </div>
                        <div>
                          {QRCodeState === "timeout" && "二维码"}
                          {QRCodeState === "incoming" && "二维码重试"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Fragment>
  );
};

export default PayModal;
