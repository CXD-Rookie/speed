/*
 * @Author: zhangda
 * @Date: 2024-05-27 11:46:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-08 16:10:20
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\IssueModal\index.tsx
 */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Fragment, useEffect, useState } from "react";
import { Modal } from "antd";

import "./index.scss";
import FeedbackForm from "./issue";
import BreakConfirmModal from "../break-confirm";

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
  const [issueOpen, setIssueOpen] = useState(false);

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

      if (message.type === "GREETING") {
        onClose();
      }
    });
  }, []);

  return (
    <Fragment>
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
        <FeedbackForm
          onClose={closeFeedbackForm}
          defaultInfo={defaultInfo}
          setIssueOpen={setIssueOpen}
        />
      </Modal>
      <BreakConfirmModal
        type={"issueFeedback"}
        accelOpen={issueOpen}
        setAccelOpen={setIssueOpen}
        onConfirm={() => {
          setIssueOpen(false);
          closeFeedbackForm();
        }}
      />
    </Fragment>
  );
};

export default FeedbackPopup;
