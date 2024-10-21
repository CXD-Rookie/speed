/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-10 18:31:42
 * @FilePath: \speed\src\containers\login-user\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Popover, Tooltip } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

import payApi from "@/api/pay";
import MinorModal from "../minor";
import RealNameModal from "../real-name";
import UserAvatarCom from "./user-avatar";
import SettingsModal from "../setting";
import PayModal from "../Pay";
import CustonCoupon from "./custom-coupon";
import "./index.scss";

import bannerRechargeIcon from "@/assets/images/common/banner-recharge.png";
import bannerRenewalIcon from "@/assets/images/common/banner-renewal.png";
import fanhuiIcon from "@/assets/images/common/fanhui.svg";
import closeIcon from "@/assets/images/common/cloture.svg";

interface CustomDropdownProps {
  isCouponRefresh?: number;
}
const inilitePagination = { page: 1, pagesize: 20 };

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const { isCouponRefresh } = props;

  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);

  const [open, setOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const [couponOpen, setCouponOpen] = useState(false); // 优惠券 modal
  const [couponTooltip, setCouponTooltip] = useState(
    localStorage.getItem("isCouponExpiry") === "1"
  ); // 优惠券提醒是否到期

  const [tableTotal, setTableTotal] = useState(0); // 可使用优惠券数量
  const [currencyTable, setCurrencyTable] = useState([]); // 可使用优惠券

  const [makeSearch] = useState({ type: 2, status: 1 }); // 可使用优惠券请求参数
  const [makePagination, setMakePagination] = useState(inilitePagination); // 可使用优惠券请求分页

  const [isFirst, setIsFirst] = useState(1);
  
  const [isShowUserT, setIsShowUserT] = useState(false); // 是否展示用户信息在是否优惠券到期文案
  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setMakePagination(inilitePagination);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // 获取可使用优惠券
  const fetchRecords = async (
    search: any = makeSearch,
    default_pagination = inilitePagination
  ) => {
    try {
      const res = await payApi.redeemList({
        ...search,
        ...default_pagination,
        sort: "redeem_code.goods_expire_time:1",
      });
      const data = res?.data?.list || [];
      const total = res?.data?.total || 0;

      if (search?.status === 1) {
        setTableTotal(total);
        setCurrencyTable(default_pagination?.page > 1 ? [...currencyTable, ...data]: data);
      }

      return {
        data,
        total,
      };
    } catch (error) {
      console.log(error);
    }
  };

  function getCouponTimeLock() {
    // 获取当前日期时间
    let now = new Date();

    // 计算明天的日期
    now.setDate(now.getDate() + 1);
    // 设置时间为00:00:00
    now.setHours(0, 0, 0, 0);

    // 获取该时间的时间戳，并转换为秒级时间戳
    return Math.floor(now.getTime() / 1000);
  }

  useEffect(() => {
    const iniliteFun = async () => {
      const record: any = (await fetchRecords())?.data; // 优惠券列表
      const timestamp = Number(localStorage.getItem("timestamp")); // 服务端返回的当前时间
      const isHave = record.some(
        (item: any) =>
          item?.redeem_code?.goods_expire_time - timestamp <= 432000
      ); // 判断优惠券中是否包含到期时间在5天以内的
      
      if (isHave) {
        setIsShowUserT(true);
      }
    }

    if (isFirst === 1 || open) {
      setIsFirst(isFirst + 1);
      
      if (open) {
        iniliteFun()
      }
    }
  }, [open]);

  useEffect(() => {
    const iniliteFun = async () => {
      const tiem_lock: any = getCouponTimeLock();
      const timestamp = Number(localStorage.getItem("timestamp")); // 服务端返回的当前时间
      const record: any = (await fetchRecords())?.data;
      const couponTimeLock = localStorage.getItem("couponTimeLock") || 0; // 每天00点的时间锁
      const isHave = record.some(
        (item: any) =>
          item?.redeem_code?.goods_expire_time - timestamp <= 432000
      ); // 判断优惠券中是否包含到期时间在5天以内的

      if (isHave && timestamp > Number(couponTimeLock)) {
        localStorage.setItem("isCouponExpiry", "1"); // 是否距离优惠券过期小于5天
        setCouponTooltip(true); // 判断是否到期提醒弹窗
      }
      
      if (!isHave) {
        localStorage.removeItem("isCouponExpiry");
      }

      localStorage.setItem("couponTimeLock", tiem_lock);
    };

    iniliteFun();
  }, [isCouponRefresh]);

  const popoverContent = (isVip: boolean) => (
    <div className="dropdown-content">
      <div className="avatar-box">
        <div>
          <UserAvatarCom
            isVip={accountInfo?.userInfo?.is_vip}
            isLogin={accountInfo?.isLogin}
            type={"edit"}
          />
          <span className="name-text">
            <span
              style={{
                color: accountInfo?.userInfo.is_vip ? "#f2d4a6" : "#fff",
              }}
            >
              {accountInfo?.userInfo?.nickname}
            </span>
            {accountInfo?.userInfo.is_vip && (
              <div>
                会员到期：
                {formatDate(accountInfo?.userInfo.vip_expiration_time - 86400)}
              </div>
            )}
          </span>
        </div>
        <span
          className={isVip ? "vips" : "novips"}
          onClick={() => {
            hide();
            setEditOpen(true);
          }}
        >
          编辑
        </span>
      </div>
      <img
        className={"banner"}
        src={isVip ? bannerRenewalIcon : bannerRechargeIcon}
        alt=""
        onClick={() => {
          const isRealNamel = localStorage.getItem("isRealName");

          hide();

          if (isRealNamel === "1") {
            dispatch(openRealNameModal());
            return;
          } else if (!accountInfo?.userInfo?.user_ext?.is_adult) {
            setIsMinorOpen(true);
            setMinorType("recharge");
            return;
          } else {
            setIsModalOpenVip(true);
          }
        }}
      />
      <div className="login-user-line" />
      <div className="login-suer-coupon">
        <span className="text">
          我的优惠券
          {isShowUserT && (
            <span className="coupon">优惠劵即将到期</span>
          )}
        </span>
        <span
          className="num"
          onClick={() => {
            setOpen(false);
            setCouponOpen(true);
          }}
        >
          {tableTotal}张优惠券
          <img src={fanhuiIcon} alt="" />
        </span>
      </div>
    </div>
  );

  return (
    <div className="custom-dropdown">
      <Popover
        placement="bottomRight"
        trigger="click"
        arrow={false}
        open={open}
        onOpenChange={handleOpenChange}
        content={popoverContent(accountInfo?.userInfo.is_vip)}
      >
        <div className="user-text">
          <UserAvatarCom
            isVip={accountInfo?.userInfo?.is_vip}
            isLogin={accountInfo?.isLogin}
          />
        </div>
      </Popover>
      {couponTooltip && (
        <Tooltip
          overlayClassName={"custom-dropdown-ant-tooltip-overlay"}
          title={
            <div className="custom-dropdown-title-tooltip">
              优惠券即将到期
              <img
                src={closeIcon}
                alt=""
                onClick={() => {
                  setCouponTooltip(false);
                  localStorage.removeItem("isCouponExpiry");
                }}
              />
            </div>
          }
          placement={"bottomRight"}
          open={couponTooltip}
        >
          <span className="user-text"></span>
        </Tooltip>
      )}

      {editOpen ? (
        <SettingsModal
          type="edit"
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {isRealOpen ? <RealNameModal /> : null}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
      <CustonCoupon
        open={couponOpen}
        setOpen={(event: boolean) => setCouponOpen(event)}
        value={currencyTable}
        fetchRecords={fetchRecords}
        makeParams={{
          makeSearch,
          makePagination,
          makeTotal: tableTotal,
          makeData: currencyTable,
          setMakePagination,
        }}
      />
    </div>
  );
};

export default CustomDropdown;
