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
import React, { Fragment, useState } from "react";
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

  const [issueOpen, setIssueOpen] = useState(false);

  const closeFeedbackForm = (open: any = false) => {
    dispatch(setFeedbackPopup({ open, defaultInfo: "" }));
  };

  return (
    <Fragment>
      <Modal
        className="overlay"
        open={open}
        onCancel={() => closeFeedbackForm(false)}
        title="问题反馈"
        width={"67.6vw"}
        centered
        destroyOnClose
        maskClosable={false}
        footer={null}
      >
        {open && (
          <FeedbackForm
            onClose={closeFeedbackForm}
            defaultInfo={defaultInfo}
            setIssueOpen={setIssueOpen}
          />
        )}
        <BreakConfirmModal
          type={"issueFeedback"}
          accelOpen={issueOpen}
          setAccelOpen={closeFeedbackForm}
          onConfirm={() => {
            setIssueOpen(false);
            closeFeedbackForm();
          }}
        />
      </Modal>
    </Fragment>
  );
};

export default FeedbackPopup;
