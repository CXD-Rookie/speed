/*
 * @Author: zhangda
 * @Date: 2024-06-28 16:06:25
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-17 18:07:21
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\app-close\index.tsx
 */
import React, { useState, useEffect } from "react";
import { Button, Modal, Radio, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAppCloseOpen } from "@/redux/actions/modal-open";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import eventBus from "@/api/eventBus";

import "./index.scss";

const AppCloseModal: React.FC = (props) => {
  const dispatch = useDispatch();

  const open = useSelector((state: any) => state?.modalOpen?.appCloseOpen);

  const { identifyAccelerationData } = useGamesInitialize();

  const [eventType, setEventType] = useState("1");
  const [noMorePrompts, setNoMorePrompts] = useState(() => {
    const storedValue = localStorage.getItem("noMorePrompts");
    return storedValue === "true"; // 如果 storedValue 为 null，则默认返回 false
  });

  // 点击确定
  const onConfirm = (state: any) => {
    let is_acc = identifyAccelerationData()?.[0];

    if (state === 0) {
      (window as any).NativeApi_MinimizeToTray(); // 最小化托盘
    } else {
      if (is_acc) {
        eventBus.emit("showModal", { show: is_acc, type: "exit" });
      } else {
        (window as any)?.stopProcessReset("exit"); // 关闭主程序
      }
    }
  };

  const onChange = (e: CheckboxChangeEvent) => {
    let checked = e.target.checked;

    setNoMorePrompts(checked);
  };

  // 在点击确认按钮时，如果 noMorePrompts 为 true，则更新配置
  const clickConfirm = () => {
    console.log(eventType, noMorePrompts);
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    const action_value = String(eventType) === "1" ? 1 : 0;

    sign.close_button_action = action_value; // 1 表示关闭程序，0 表示隐藏到托盘

    if (noMorePrompts) {
      localStorage.setItem("noMorePrompts", String(true));
    }

    localStorage.setItem("client_settings", JSON.stringify(sign));
    (window as any).NativeApi_UpdateConfig("close_button_action", action_value);

    dispatch(setAppCloseOpen(false));
    onConfirm(Number(eventType));
  };

  const handleRadioChange = (e: any) => {
    setEventType(e.target.value);
  };

  useEffect(() => {
    if (open) {
      const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
      const closeButtonAction = sign?.close_button_action;
      console.log("初始化设置值:", closeButtonAction);
      setEventType(
        String(
          closeButtonAction !== undefined
            ? closeButtonAction === 1
              ? 1
              : 0
            : 1
        )
      );
    }
  }, [open]);

  return (
    <Modal
      className="app-close-module"
      open={open}
      title="关闭窗口"
      width={"40vw"}
      centered
      destroyOnClose
      maskClosable={false}
      onCancel={() => dispatch(setAppCloseOpen(false))}
      footer={null}
    >
      <div className="app-close-module-content">
        <div>当关闭窗口时</div>
        <Radio.Group
          className="content-radio-group"
          value={eventType}
          onChange={handleRadioChange}
        >
          <Radio value={"0"}>
            <span style={{ color: "#fff", fontSize: "1.4vw" }}>
              隐藏任务到托盘
            </span>
          </Radio>
          <Radio value={"1"}>
            <span style={{ color: "#fff", fontSize: "1.4vw" }}>关闭程序</span>
          </Radio>
        </Radio.Group>
        <div>
          <Button
            className="content-confirm"
            disabled={!eventType}
            type="primary"
            onClick={clickConfirm}
          >
            确定
          </Button>
        </div>
        <Checkbox
          className="content-no-tooltip"
          value={noMorePrompts}
          onChange={onChange}
        >
          不再提示
        </Checkbox>
      </div>
    </Modal>
  );
};

export default AppCloseModal;
