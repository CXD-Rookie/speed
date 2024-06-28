/*
 * @Author: zhangda
 * @Date: 2024-06-28 16:06:25
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-28 16:49:19
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\app-close\index.tsx
 */
import React from "react";
import { useSelector } from "react-redux";
import { Button, Modal, Radio, Checkbox } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

import "./index.scss";

interface AppCloseModalProps {
  open: boolean;
  close: (e: any) => void;
}

const AppCloseModal: React.FC<AppCloseModalProps> = (props) => {
  const { open, close } = props;

  const accountInfo: any = useSelector((state: any) => state.accountInfo);

  const onChange = (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`);
  };

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
          onChange={() => {
            // let value = e.target.value;
          }}
          // value={closeWindow}
        >
          <Radio value={"1"}>隐藏任务到托盘</Radio>
          <Radio value={"2"}>关闭程序</Radio>
        </Radio.Group>
        <Button className="content-confirm" type="primary">
          确定
        </Button>
        <Checkbox className="content-no-tooltip" onChange={onChange}>
          不再提示
        </Checkbox>
      </div>
    </Modal>
  );
};

export default AppCloseModal;
