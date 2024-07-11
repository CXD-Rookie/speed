/*
 * @Author: zhangda
 * @Date: 2024-06-28 16:06:25
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-10 18:43:43
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\app-close\index.tsx
 */
import React, { useState, useEffect } from "react";
import { Button, Modal, Radio, Checkbox } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

import "./index.scss";

interface AppCloseModalProps {
  open: boolean;
  close: (e: any) => void;
  onConfirm?: (e: any) => void;
}

const AppCloseModal: React.FC<AppCloseModalProps> = (props) => {
  const { open, close, onConfirm = () => {} } = props;

  const [eventType, setEventType] = useState("0");
  const [noMorePrompts, setNoMorePrompts] = useState(() => {
    const storedValue = localStorage.getItem("noMorePrompts");
    return storedValue === "true"; // 如果 storedValue 为 null，则默认返回 false
  });

  const initialCloseWindow = () => {
    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    const closeButtonAction = sign?.close_button_action;
    return String(closeButtonAction === 1 ? 1 : 2);
  };

  const [closeWindow, setCloseWindow] = useState<string>(initialCloseWindow);


  const onChange = (e: CheckboxChangeEvent) => {
    let checked = e.target.checked;
    setNoMorePrompts(checked);
    localStorage.setItem("noMorePrompts", String(checked));
  };

  // 在点击确认按钮时，如果 noMorePrompts 为 true，则更新配置
  const clickConfirm = () => {
    if (noMorePrompts) {
      (window as any).NativeApi_UpdateConfig("close_button_action", Number(eventType));
    }

    close(false);
    onConfirm(Number(eventType));
  };

  const handleRadioChange = (e: any) => {
    const value = e.target.value;
    setCloseWindow(value);

    const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
    sign.close_button_action = value === "2" ? 1 : 0; // 1 表示关闭程序，0 表示隐藏到托盘
    localStorage.setItem("client_settings", JSON.stringify(sign));

    console.log("Updated client_settings in localStorage:", sign);
    if (value === '2') {
      localStorage.setItem("noMorePrompts", String(true));
    }
    
    (window as any).NativeApi_UpdateConfig(
      "close_button_action",
      value === "2" ? 1 : 0
    );
  };

  useEffect(() => {
    if (open) {
      const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
      const closeButtonAction = sign?.close_button_action;
      console.log("初始化设置值:", closeButtonAction);
      setEventType(String(closeButtonAction !== undefined ? (closeButtonAction === 1 ? 2 : 1) : 2));
    }
  }, [open]);

  useEffect(() => {
    console.log("closeWindow",closeWindow)
  }, [closeWindow]);

  return (
    <Modal
      className="app-close-module"
      open={open}
      title="关闭窗口"
      width={"40vw"}
      centered
      destroyOnClose
      maskClosable={false}
      onCancel={() => close(false)}
      footer={null}
    >
      <div className="app-close-module-content">
        <div>当关闭窗口时</div>
        <Radio.Group
          className="content-radio-group"
          value={closeWindow}
          onChange={handleRadioChange}
        >
          <Radio value={"1"}>隐藏任务到托盘</Radio>
          <Radio value={"2"}>关闭程序</Radio>
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
        <Checkbox className="content-no-tooltip" onChange={onChange}>
          不再提示
        </Checkbox>
      </div>
    </Modal>
  );
};

export default AppCloseModal;
