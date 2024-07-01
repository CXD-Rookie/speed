/*
 * @Author: zhangda
 * @Date: 2024-06-28 16:06:25
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-28 17:37:31
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

  const [eventType, setEventType] = useState("");
  const [noMorePrompts, setNoMorePrompts] = useState(false);

  const onChange = (e: CheckboxChangeEvent) => {
    let checked = e.target.checked;

    console.log(`checked = ${e.target.checked}`);
    setNoMorePrompts(checked);
  };

  const clickConfirm = () => {
    localStorage.setItem("settingsModified", String(noMorePrompts));
    close(false);
    onConfirm(true);
  };

  useEffect(() => {
    if (open) {
      setEventType(String(localStorage.getItem("close_window_sign") || 0));
    }
  }, [open]);

  return (
    <Modal
      className="app-close-module"
      open={open}
      title="关闭窗口"
      width={"40vw"}
      centered
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
          <Radio value={"0"}>隐藏任务到托盘</Radio>
          <Radio value={"1"}>关闭程序</Radio>
        </Radio.Group>
        <div>
          <Button
            className="content-confirm"
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
