/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 14:29:12
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-29 14:45:02
 * @FilePath: \speed\src\containers\active\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// index.tsx 
import React from 'react';
import './index.scss';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  return (
    <div className={`modal-wrapper ${isVisible ? 'visible' : ''}`}>
      <div className="modal-content">
        <div className="close-button" onClick={onClose}>×</div>
        <h3>恭喜！领取成功！</h3>
        <p>您已获得<span className="highlight">3天免费会员体验</span></p>
        <h6>有效期至2024.07.26</h6>
        <button className="confirm-button" onClick={onClose}>好的</button>
      </div>
    </div>
  );
};

export default Modal;