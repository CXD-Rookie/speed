/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-25 17:40:11
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\minor\index.tsx
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { closeRealNameModal } from "@/redux/actions/auth";
import "./index.scss";

import realErrorIcon from "@/assets/images/common/real_error.svg";
import realSucessIcon from "@/assets/images/common/real-sucess.svg";

interface MinorModalProps {
  type: string;
  isMinorOpen: boolean;
  setIsMinorOpen: (open: boolean) => void;
}

const MinorModal: React.FC<MinorModalProps> = (props) => {
  const { type, isMinorOpen, setIsMinorOpen } = props;

  // 认证类型 2 - 加速时未成年 3 - 充值时未成年 1 - 认证成功
  const [realType, setRealType] = useState<any>();
  const dispatch = useDispatch();

  const handleClose = () => {
    setIsMinorOpen(false)
    dispatch(closeRealNameModal());
  };
  useEffect(() => {
    // 未成年 recharge充值 acceleration 加速
    if (type === "recharge") {
      setRealType(3);
    } else if (type === "acceleration") {
      setRealType(2);
    } else if (type === "success") {
      setRealType(1);
    }
  }, [type]);

  return isMinorOpen ? (
    <Modal
      className="real-name-minor-modal"
      open={isMinorOpen}
      destroyOnClose
      title="提示"
      width={"32vw"}
      centered
      maskClosable={false}
      footer={null}
      onCancel={() => handleClose()}
    >
      {(realType === 2 || realType === 3) && (
        <div className="real-sueccess-modal-content real-error-modal-content">
          <img src={realErrorIcon} width={69} height={69} alt="" />
          <p>
            抱歉，根据国家相关法律法规要求，暂不支持未成年人使用
            {realType === 2 && "加速"}
            {realType === 3 && "充值"}
            服务，感谢您的理解！
          </p>
          <Button
            className="real-sueccess-btn"
            onClick={() => handleClose()}
          >
            好的
          </Button>
        </div>
      )}
      {realType === 1 && (
        <div className="real-sueccess-modal-content">
          <img src={realSucessIcon} width={69} height={69} alt="" />
          <p>恭喜，实名认证成功</p>
          <Button
            className="real-sueccess-btn"
            onClick={() =>
              handleClose()
            }
          >
            好的
          </Button>
        </div>
      )}
    </Modal>
  ) : null;
};

export default MinorModal;
