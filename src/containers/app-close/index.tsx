/*
 * @Author: zhangda
 * @Date: 2024-06-28 16:06:25
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-08 10:54:22
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
  const [noMorePrompts, setNoMorePrompts] = useState(false);

  const onChange = (e: CheckboxChangeEvent) => {
    let checked = e.target.checked;

    setNoMorePrompts(checked);
  };

  const clickConfirm = () => {
    if (noMorePrompts) {
      (window as any).NativeApi_UpdateConfig(
        "close_button_action",
        Number(eventType)
      );
    }

    close(false);
    onConfirm(Number(eventType));
  };

  useEffect(() => {
    if (open) {
      const sign = JSON.parse(localStorage.getItem("client_settings") || "{}");
      const closeButtonAction = sign?.close_button_action;
      console.log("初始化设置值:", closeButtonAction);
      setEventType(String(closeButtonAction !== undefined ? (closeButtonAction === 1 ? 2 : 1) : 2));
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
      onCancel={() => close(false)}
      footer={null}
    >
      <div className="app-close-module-content">
        <div>当关闭窗口时</div>
        <Radio.Group
          className="content-radio-group"
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
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
