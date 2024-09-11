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
import { useSelector } from "react-redux";
import { convertSecondsToDays,formatDate } from "@/common/utils";
import './index.scss';

interface ActiveModalProps {
  isVisible: boolean;
  onClose: () => void;
  value?: any;
}

const Active: React.FC<ActiveModalProps> = (props) => {
  const { isVisible, onClose, value = {} } = props;

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const vip_experience_time = localStorage.getItem("vip_experience_time");

  const [currencyInfo, setCurrencyInfo] = useState<any>({
    rebates_time: vip_experience_time ? JSON.parse(vip_experience_time) : 0,
    vip_time: accountInfo?.userInfo.vip_expiration_time - 86400,
  });

  useEffect(() => {
    if (Object?.keys(value)?.length > 0) {
      console.log(111, value);
      
      setCurrencyInfo({
        name: value?.name,
        rebates_time: 0,
        vip_time: value?.goods_expire_time,
      });
    }
  }, [value]);

  return (
    <div className={`modal-wrapper ${isVisible ? "visible" : ""}`}>
      <div className="modal-content">
        <div className="close-button" onClick={onClose}>
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
        <h6>
          有效期至
          {formatDate(currencyInfo?.vip_time || 0)}
        </h6>
        <button className="confirm-button" onClick={onClose}>
          好的
        </button>
      </div>
    </div>
  );
};

export default Active;