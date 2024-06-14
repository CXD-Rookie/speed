/*
 * @Author: zhangda
 * @Date: 2024-05-27 11:46:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-14 16:17:42
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\IssueModal\index.tsx
 */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useEffect } from "react";
import { Modal } from "antd";

import "./index.scss";

interface FeedbackTypeProps {
  showIssueModal?: boolean;
  onClose?: () => void;
}

const FeedbackPopup: React.FC<FeedbackTypeProps> = (props) => {
  const { showIssueModal = false, onClose = () => {} } = props;

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.origin !== "http://192.168.111.114:3001") {
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
      <iframe
        id="myIframe"
        src={`http://192.168.111.114:3001/issue.html`}
      ></iframe>
    </Modal>
  );
};

export default FeedbackPopup;
