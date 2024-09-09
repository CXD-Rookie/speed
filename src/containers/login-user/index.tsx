/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-10 18:31:42
 * @FilePath: \speed\src\containers\login-user\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Popover } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

import MinorModal from "../minor";
import RealNameModal from "../real-name";
import UserAvatarCom from "./user-avatar";
import SettingsModal from "../setting";
import PayModal from "../Pay";
import CustonCoupon from "./custom-coupon";
import "./index.scss";

import bannerRechargeIcon from "@/assets/images/common/banner-recharge.svg";
import bannerRenewalIcon from "@/assets/images/common/banner-renewal.svg";

interface CustomDropdownProps {}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);

  const [open, setOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  const [couponOpen, setCouponOpen] = useState(false);

  const [isFirst, setIsFirst] = useState(1);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isFirst === 1 || open) {
      setIsFirst(isFirst + 1);
    }
  }, [open]);

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
          <span className="coupon">优惠劵即将到期</span>
        </span>
        <span className="num" onClick={() => {
          setOpen(false)
          setCouponOpen(true);
        }}>
          {}张优惠券
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
      {couponOpen ? <CustonCoupon open={couponOpen} /> : null}
    </div>
  );
};

export default CustomDropdown;
