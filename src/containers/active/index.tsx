/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-01 14:01:37
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React, { useState, useEffect, useRef, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRemainingDays,formatDate } from "@/common/utils";
import './index.scss';

interface ActiveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Active: React.FC<ActiveModalProps> = ({ isVisible, onClose }) => {

    const accountInfo: any = useSelector((state: any) => state.accountInfo);
    useEffect(() => {
    console.log(accountInfo,"---------------用户信息")
    }, [accountInfo])

  return (
    <div className={`modal-wrapper ${isVisible ? 'visible' : ''}`}>
      <div className="modal-content">
        <div className="close-button" onClick={onClose}>×</div>
        <h3>恭喜！领取成功！</h3>
        <p>您已获得<span className="highlight">{getRemainingDays(accountInfo.userInfo.vip_expiration_time)}天免费会员体验</span></p>
        <h6>有效期至{formatDate(accountInfo?.userInfo.vip_expiration_time - 86400)}</h6>
        <button className="confirm-button" onClick={onClose}>好的</button>
      </div>
    </div>
  );
};

export default Active;