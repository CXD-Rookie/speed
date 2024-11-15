/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-10 16:50:58
 * @important: 重要提醒
 * @Description: 启动路径弹窗页面
 * @FilePath: \speed\src\containers\activation-mode\index.tsx
 */
import React, { useState, useEffect } from "react";
import { Modal, Button, Select, Input } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setStartPathOpen } from "@/redux/actions/modal-open";

import "./index.scss";

import humanStartOIcon from "@/assets/images/common/human-start-o.png";
import autoStartOIcon from "@/assets/images/common/auto-start-o.png";
import humanStartWIcon from "@/assets/images/common/human-start-w.png";
import autoStartWIcon from "@/assets/images/common/auto-start-w.png";
import tickIcon from "@/assets/images/common/tick.png";

const { Option } = Select;

interface ActivationModalProps {
  options: any;
  notice?: (option: any) => void;
}

const ActivationModal: React.FC<ActivationModalProps> = (props) => {
  const { options } = props;
  
  // 控制弹窗的开关
  const open = useSelector((state: any) => state?.modalOpen?.startPathOpen);
  const dispatch: any = useDispatch();

  const [filePath, setFilePath] = useState(); // 启动路径
  const [quickStartType, setQuickStartType] = useState("human"); // 快捷启动类型 auto 自动 human 手动
  const [selectPlatform, setSelectPlatform] = useState<string>(); // 选择的游戏平台

  const [platforms, setPlatforms] = useState<any>([]); // 所有的运营平台
  const [startPathError, setStartPathError] = useState("0"); // 启动路径错误类型 0 正常 1 无路径
  
  // 取消函数
  const onCancel = () => {
    setStartPathError("0")
    dispatch(setStartPathOpen(false));
  };
  
  // 点击保存启动路径
  const handleSave = () => {
    const startStorage = localStorage.getItem("startAssemble"); // localStorage存储的启动游戏信息
    const startAssemble = startStorage ? JSON.parse(startStorage) : [];
    
    const findIndex = startAssemble.findIndex(
      (item: any) => item?.id === options?.id
    ); // 查找当前游戏的索引

    let temp = {}
    // 如果找到，先删除已存在的游戏启动信息
    if (findIndex !== -1) {
      temp = startAssemble?.[findIndex];
      startAssemble.splice(findIndex, 1);
    }

    let name = platforms.find((item: any) => item?.pid === selectPlatform)?.name;
    // 当前保存的启动信息存
    startAssemble.unshift({
      ...temp,
      id: options?.id,
      path: filePath,
      pid: selectPlatform,
      pc_platform: Number(selectPlatform),
      start: quickStartType,
      name
    });
    console.log(startAssemble);
    
    localStorage.setItem("startAssemble", JSON.stringify(startAssemble)); // 更新localStorage
    onCancel(); // 关闭弹窗
  };

  // 点击快捷启动方式
  const onClickQuickStart = (value: string) => {
    if (value === "auto" && !filePath) setStartPathError("1");
    setQuickStartType(value);
  };

  // 调用触发读取文件的函数
  const handleInputChange = () => {
    new Promise((resolve, reject) => {
      (window as any).NativeApi_AsynchronousRequest(
        "NativeApi_SelectFilePath",
        "",
        function (response: any) {
          const isCheck = JSON.parse(response);

          if (isCheck?.path) {
            setFilePath(isCheck?.path); // 更新启动路径
            setStartPathError("0") // 去除启动路径错误
          }
        }
      );
    });
  };

  const clickSelectPlatform = async (e: string) => {
    let path = platforms.filter((item: any) => item?.pid === e)?.[0];

    setSelectPlatform(e);
    setFilePath(path?.path || "");
  };

  const initialFetch = async () => {
    let storage: any = localStorage.getItem("startAssemble"); // 读取游戏启动路径信息
    let assemble = storage ? JSON.parse(storage) : []; // 解析存储游戏id 平台列表
    let hitGame = assemble.find((item: any) => item?.id === options?.id); // 当前游戏的启动信息

    setPlatforms(hitGame?.platform);
    setFilePath(hitGame?.path); // 更新文件路径
    setSelectPlatform(hitGame?.pid); // 更新启动平台
    setQuickStartType(hitGame?.start ?? "human"); // 更新启动类型
  };

  // 初始化
  useEffect(() => {
    if (open) {
      initialFetch();
    }
  }, [open]);
  
  return (
    <Modal
      className="activation-modal"
      open={open}
      title="启动方式"
      width={"40vw"}
      centered
      destroyOnClose
      maskClosable={false}
      footer={null}
      onCancel={onCancel}
    >
      {/* 用于遮挡启动方式弹窗，防止操作的模罩层 */}
      {/* <div className="mask" /> */}
      <div className="activation-modal-content">
        <div className="quick-start">快捷启动</div>
        <div className="quick-tabs">
          <div
            className={`tab ${
              quickStartType === "auto" ? "active-tab" : "default-tab"
            }`}
            onClick={() => onClickQuickStart("auto")}
          >
            <img
              src={quickStartType === "auto" ? autoStartOIcon : autoStartWIcon}
              alt=""
            />
            {quickStartType === "auto" && (
              <img className="tick" src={tickIcon} alt="" />
            )}
            自动启动
          </div>
          <div
            className={`tab ${
              quickStartType === "human" ? "active-tab" : "default-tab"
            }`}
            onClick={() => onClickQuickStart("human")}
          >
            <img
              src={
                quickStartType === "human" ? humanStartOIcon : humanStartWIcon
              }
              alt=""
            />
            {quickStartType === "human" && (
              <img className="tick" src={tickIcon} alt="" />
            )}
            手动启动
          </div>
        </div>
        <div className="content-title">启动平台：</div>
        {platforms?.length > 1 ? (
          <Select
            className="content-select"
            value={selectPlatform}
            onChange={(e) => clickSelectPlatform(e)}
          >
            {platforms?.length > 0 &&
              platforms.map((item: any) => {
                return (
                  <Option value={item?.pid} key={item?.pid}>
                    {String(item?.pid) === "0" ? "自定义" : item?.name}
                  </Option>
                );
              })}
          </Select>
        ) : (
          <div className="content-select-div">
            {
              (platforms || []).find(
                (item: any) => item?.pid === selectPlatform
              )?.name
            }
          </div>
        )}
        <div className="content-title">启动路径：</div>
        <div className="content-path-box">
          <Input
            className="content-input"
            style={{ width: selectPlatform === "0" ? "30.8vw" : "38.8vw" }}
            disabled
            value={filePath}
          />
          {selectPlatform === "0" && (
            <Button className="content-btn" onClick={handleInputChange}>
              浏览
            </Button>
          )}
          {startPathError === "1" && (
            <div className="path-error">请先添加启动路径</div>
          )}
        </div>
        <Button
          className="save-btn"
          type="default"
          onClick={handleSave}
          disabled={!filePath}
        >
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default ActivationModal;
