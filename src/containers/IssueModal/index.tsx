/*
 * @Author: zhangda
 * @Date: 2024-05-27 11:46:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-20 11:28:36
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\IssueModal\index.tsx
 */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useEffect } from "react";
import { Modal } from "antd";
import FeedbackForm from "./issue";
import "./index.scss";

interface FeedbackPopupProps {
  showIssueModal?: boolean;
  defaultInfo?: string | null;
  onClose?: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  showIssueModal = false,
  defaultInfo,
  onClose = () => {},
}) => {
  const closeFeedbackForm = () => {
    onClose();
  };

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.origin !== "http://192.168.111.119:3001") {
        return;
      }

      // 处理来自 iframe 的消息
      const message = event.data;
      console.log(message);
      if (message.type === "GREETING") {
        onClose();
      }
    });
  }, []);

  return (
    <Modal
      className="overlay"
      open={showIssueModal}
      onCancel={onClose}
      title="问题反馈"
      width={"67.6vw"}
      centered
      maskClosable={false}
      footer={null}
    >
      <FeedbackForm onClose={closeFeedbackForm} defaultInfo={defaultInfo} />
    </Modal>
  );
};

export default FeedbackPopup;
