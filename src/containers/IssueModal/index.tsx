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
import React, { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "antd";
import { setFeedbackPopup } from "@/redux/actions/modal-open";

import "./index.scss";
import FeedbackForm from "./issue";
import BreakConfirmModal from "../break-confirm";

const FeedbackPopup: React.FC = () => {
  const dispatch = useDispatch();

  const { open = false, defaultInfo = ""} = useSelector(
    (state: any) => state?.modalOpen?.feedbackPopup
  );
  
  const closeFeedbackForm = (open: any = false) => {
    dispatch(setFeedbackPopup({ open }));
  };

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.origin !== "http://192.168.111.119:3001") {
        return;
      }

      // 处理来自 iframe 的消息
      const message = event.data;

      if (message.type === "GREETING") {
        closeFeedbackForm();
      }
    });
  }, []);

  return (
    <Fragment>
      <Modal
        className="overlay"
        open={open}
        onCancel={closeFeedbackForm}
        title="问题反馈"
        width={"67.6vw"}
        centered
        maskClosable={false}
        footer={null}
      >
        <FeedbackForm
          onClose={closeFeedbackForm}
          defaultInfo={defaultInfo}
          setIssueOpen={closeFeedbackForm}
        />
      </Modal>
      <BreakConfirmModal
        type={"issueFeedback"}
        accelOpen={open}
        setAccelOpen={closeFeedbackForm}
        onConfirm={closeFeedbackForm}
      />
    </Fragment>
  );
};

export default FeedbackPopup;
