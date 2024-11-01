/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-02 10:45:14
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewUserOpen } from "@/redux/actions/modal-open";
import { setAccountInfo } from "@/redux/actions/account-info";

import './newOpen.scss';
import closeIcon from "@/assets/images/common/cloture.svg";

const ActiveNew: React.FC = () => {
  const dispatch: any = useDispatch();

  const open = useSelector((state: any) => state?.modalOpen?.newUserOpen);
  
  const onCancel = (e?: any) => {
    dispatch(setNewUserOpen(false))
    setTimeout(() => {
      if (e !== "no") {
        dispatch(setAccountInfo(undefined, undefined, true));
      }
      localStorage.setItem("isActiveNew", "1");
    }, 500);
  }

  return (
    <div className={`modal-wrapper-new ${open ? "visible" : "visibleNone"}`}>
      <div className="close-icon-box" onClick={() => onCancel("no")}>
        <img className="close-icon" src={closeIcon} alt="" />
      </div>
      <div className="modal-content" onClick={onCancel}></div>
    </div>
  );
};

export default ActiveNew;