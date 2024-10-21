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

import './newOpen.scss';
import closeIcon from "@/assets/images/common/cloture.svg";

interface ActiveModalNewProps {
  isVisible: boolean;
  setOpen?: (e: boolean) => void;
  onClose: (e?: any) => void;
}

const ActiveNew: React.FC<ActiveModalNewProps> = ({
  isVisible,
  setOpen = () => {},
  onClose,
}) => {
  return (
    <div
      className={`modal-wrapper-new ${isVisible ? "visible" : "visibleNone"}`}
    >
      <div className="close-icon-box" onClick={() => onClose("no")}>
        <img className="close-icon" src={closeIcon} alt="" />
      </div>
      <div className="modal-content" onClick={onClose}></div>
    </div>
  );
};

export default ActiveNew;