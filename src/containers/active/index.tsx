/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-22 16:12:25
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React from "react";
import { useSelector } from "react-redux";
import { convertSecondsToDays,formatDate } from "@/common/utils";
import './index.scss';

interface ActiveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Active: React.FC<ActiveModalProps> = ({ isVisible, onClose }) => {
  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const vip_experience_time = localStorage.getItem("vip_experience_time");
  
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
            {convertSecondsToDays(
              Number(
                JSON.parse(
                  !(!vip_experience_time || vip_experience_time === "undefined")
                    ? vip_experience_time
                    : "0"
                )
              )
            )}
            天免费会员体验
          </span>
        </p>
        <h6>
          有效期至
          {formatDate(accountInfo?.userInfo.vip_expiration_time - 86400)}
        </h6>
        <button className="confirm-button" onClick={onClose}>
          好的
        </button>
      </div>
    </div>
  );
};

export default Active;