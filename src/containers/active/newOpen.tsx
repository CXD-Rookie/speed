/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-02 10:45:14
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React, { useEffect } from "react";

import './newOpen.scss';

interface ActiveModalNewProps {
  isVisible: boolean;
  onClose: () => void;
}

const ActiveNew: React.FC<ActiveModalNewProps> = ({ isVisible,onClose }) => {
    useEffect(() => {
    // console.log(isVisible,"---------------11111111111111")
    }, [isVisible])

  return (
    <div
      className={`modal-wrapper-new ${isVisible ? "visible" : "visibleNone"}`}
    >
      <div className="modal-content" onClick={onClose}></div>
    </div>
  );
};

export default ActiveNew;