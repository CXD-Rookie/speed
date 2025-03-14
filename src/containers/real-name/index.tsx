/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-14 15:40:51
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\real-name\index.tsx
 */
import React, { Fragment, useState } from "react";
import { Button, Input, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { closeRealNameModal, } from "@/redux/actions/auth";
import { setMinorState } from "@/redux/actions/modal-open";
import { setAccountInfo } from "@/redux/actions/account-info";

import "./index.scss";
import loginApi from "@/api/login";
import loadingGif from "@/assets/images/common/jiazai.gif";

interface SettingsModalProps {
  isAdult?: { is_adult: boolean; type: string };
}

const RealNameModal: React.FC<SettingsModalProps> = ({ isAdult }) => {
  // 认证类型 假设 0 - 未填写 1 - 成功
  const [isRankVerify, setIsRankVerify] = useState({
    name: true,
    id: true,
  }); // 校验身份信息是否通过

  const [rankRealInfo, setRankRealInfo] = useState({
    name: "",
    id: "",
  }); // 身份认证信息

  const [iniliteLoading, setIniliteLoading] = useState(false); // 全局加载动画判断值

  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);
  const dispatch: any = useDispatch();

  const handleClose = () => {
    dispatch(closeRealNameModal());
  };

  // 姓名是否合法
  function validateName(name: any) {
    // 正则表达式验证姓名
    const namePattern = /^[\u4e00-\u9fa5·]{2,30}$/;

    if (!namePattern.test(name)) {
      return false;
    } else {
      return true;
    }
  }

  // 身份证号是否合法
  function validateIDCard(id: any) {
    const idCard = id;

    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checksumChars = [
      "1",
      "0",
      "X",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += idCard[i] * weights[i];
    }

    const checksum = checksumChars[sum % 11];

    if (checksum?.toUpperCase() !== idCard[17]?.toUpperCase()) {
      return false;
      // 身份证号码校验位不正确
    } else if (!/^\d{17}[\dXx]$/.test(idCard)) {
      return false;
      // 身份证号码格式不正确
    } else {
      return true;
    }
  }

  const handleInputChange = (e: any, type: string) => {
    let value = e.target.value;

    if (type === "name") {
      setRankRealInfo({ ...rankRealInfo, name: value });
    } else {
      setRankRealInfo({ ...rankRealInfo, id: value });
    }
  };

  // 提交
  const handleSubmit = async () => {
    try {
      setIniliteLoading(true); // 开启全局加载动画

      if (
        !validateName(rankRealInfo?.name) ||
        !validateIDCard(rankRealInfo?.id)
      ) {
        setIsRankVerify({
          name: validateName(rankRealInfo?.name),
          id: validateIDCard(rankRealInfo?.id),
        });

        return;
      }

      let res = await loginApi.authenticationUser({
        platform: 3,
        ...rankRealInfo,
      });

      // 认证成功
      if (res?.error === 0) {
        setIsRankVerify({
          name: true,
          id: true,
        });
        const user_res = await loginApi.getUserInfo();

        localStorage.setItem("isRealName", "0"); //已经实名

        await dispatch(setAccountInfo(user_res?.data?.user_info, true, false));
        await dispatch(setMinorState({ open: true, type: "success" })); // 实名认证提示
      } else if (res?.error === 1) {
        // 认证失败
        setIsRankVerify({
          name: false,
          id: false,
        });
        dispatch(setMinorState({ open: false, type: "success" })); // 实名认证提示
        localStorage.setItem("isRealName", "1"); //没有实名
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIniliteLoading(false); // 开启全局加载动画
    }
  };

  return isRealOpen ? (
    <Fragment>
      <Modal
        className="real-name-modal"
        open={isRealOpen}
        destroyOnClose
        title="实名认证"
        width={"67.6vw"}
        centered
        maskClosable={false}
        footer={null}
        onCancel={handleClose}
      >
        <div className="real-modal-content">
          <p className="modal-content-text">
            根据国家相关法律法规要求，网络平台服务需实名认证，为了不影响您的使用体验，请尽快完善信息。此信息仅用于验证，严格保证您的隐私安全。
          </p>
          {iniliteLoading ? (
            <img
              style={{
                position: "absolute",
                top: "35vh",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              src={loadingGif}
              alt=""
            />
          ) : (
            <>
              <div className="modal-content-input-box">
                <div>姓名</div>
                <Input
                  placeholder="请输入您的真实姓名"
                  onChange={(e) => handleInputChange(e, "name")}
                />
                {!isRankVerify?.name && (
                  <div className="error-tootip">你输入的姓名有误！</div>
                )}
              </div>
              <div className="modal-content-input-box">
                <div>身份证号</div>
                <Input
                  placeholder="请输入你的证件号"
                  onChange={(e) => handleInputChange(e, "id")}
                />
                {!isRankVerify?.id && (
                  <div className="error-tootip">你输入的身份证号有误！</div>
                )}
              </div>
              <Button
                className="modal-content-btn"
                disabled={!rankRealInfo?.id || !rankRealInfo?.name}
                onClick={handleSubmit}
              >
                立即提交
              </Button>
            </>
          )}
        </div>
      </Modal>
    </Fragment>
  ) : null;
};

export default RealNameModal;
