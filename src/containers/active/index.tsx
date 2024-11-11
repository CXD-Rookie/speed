/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-22 16:12:25
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertSecondsToDays,formatDate } from "@/common/utils";
import { store } from "@/redux/store";
import { setDrawVipActive, setNewUserOpen } from "@/redux/actions/modal-open";

import "./index.scss";

const Active: React.FC = (props) => {
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const { open = false, value = {} } = useSelector(
    (state: any) => state?.modalOpen?.drawVipActive
  );
  
  const iniliteFun = () => {
    const vip_experience_time = localStorage.getItem("vip_experience_time");
    const accountInfo = store.getState()?.accountInfo;
    const isTrue = 
      vip_experience_time &&
      vip_experience_time !== "undefined" &&
      vip_experience_time !== "null";
    let rebates_time = isTrue ? JSON.parse(vip_experience_time ?? "{}") : 0;
    let vip_time = accountInfo?.userInfo.vip_expiration_time - 86400;
    
    return {
      rebates_time,
      vip_time,
    };
  };

  const [currencyInfo, setCurrencyInfo] = useState<any>(iniliteFun());

  // 是否无期限
  function isApproximatelyThirtyYearsApart(timestamp: any) {
    // 当前时间
    const now: any = Date.now() / 1000;
    // 计算两个日期之间的时间差（以秒为单位）
    const diffInSeconds = Math.abs(timestamp - now);
    // 平均每年的秒数 (忽略闰年)
    const secondsPerYear = 31536000;
    // 计算时间差大约为多少年
    const yearsApart = diffInSeconds / secondsPerYear;
  
    // 判断是否相差大约30年
    return yearsApart - 30 >= 0; // 允许误差范围为±2年
  }
  
  const onCancel = () => {
    dispatch(setDrawVipActive({ open: false, value: {} }));

    // 如果时新用户触发的这个逻辑
    if (!(Object?.keys(value)?.length > 0)) {
      // 标记弹窗已展示
      localStorage.setItem("isModalDisplayed", "true");
      dispatch(setNewUserOpen(false)); // 新用户弹出
    }
  }

  useEffect(() => {
    if (open) {
      setCurrencyInfo(iniliteFun());
    }
  }, [open]);

  useEffect(() => {
    if (Object?.keys(value)?.length > 0) {
      setCurrencyInfo({
        name: value?.name,
        rebates_time: 0,
        vip_time: value?.goods_expire_time,
      });
    }
  }, [value, accountInfo]);

  return (
    <div className={`modal-wrapper ${open ? "visible" : ""}`}>
      <div className="modal-content">
        <div className="close-button" onClick={onCancel}>
          ×
        </div>
        <h3>恭喜！领取成功！</h3>
        <p>
          您已获得
          <span className="highlight">
            {currencyInfo?.name ??
              convertSecondsToDays(currencyInfo?.rebates_time || 0) +
                "天免费会员体验"}
          </span>
        </p>
        {/* 如果领取弹窗是通过兑换码弹出的，那么在兑换类型为时间兑换码，也就是 type = 1时不展示 */}
        {value?.type !== 1 && (
          <h6>
            {!isApproximatelyThirtyYearsApart(currencyInfo?.vip_time) &&
              "有效期至" + formatDate(currencyInfo?.vip_time || 0)}
          </h6>
        )}
        <button className="confirm-button" onClick={onCancel}>
          好的
        </button>
      </div>
    </div>
  );
};

export default Active;