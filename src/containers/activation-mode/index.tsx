/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-02 18:22:36
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\activation-mode\index.tsx
 */
import React, { useState, useEffect } from "react";
import { Modal, Button, Select, Input } from "antd";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";
import playSuitApi from "@/api/speed";

const { Option } = Select;

interface ActivationModalProps {
  open: boolean;
  options: any;
  notice?: (option: any) => void;
  onClose: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  open = false,
  options,
  notice = () => {},
  onClose,
}) => {
  const { getGameList } = useGamesInitialize();

  const [filePath, setFilePath] = useState(
    options?.activation_method?.filePath
  ); // 启动路径
  const [selectPlatform, setSelectPlatform] = useState<string>(
    options?.activation_method?.select_platforms_id
  ); // 选择的游戏平台

  const [platforms, setPlatforms] = useState<any>({}); // 所有的运营平台

  const handleInputChange = () => {
    const requestData = JSON.stringify({
      method: "NativeApi_SelectFilePath",
    });
    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("获取返回路径=========================:", response);
        setFilePath(response.path);
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("Query failed:", errorMessage);
      },
    });
  };

  const handleSave = () => {
    // 这个逻辑需要在打开文件之后回调处理，这是保存的逻辑
    let games_list = getGameList();
    let games_option = { ...options }; // 当前游戏数据

    games_option.activation_method = {
      select_platforms_id: selectPlatform,
      filePath,
    }; // 添加 start_path 属性

    let find_index = games_list.findIndex(
      (item: any) => games_option?.id === item?.id
    );

    if (find_index !== -1) {
      games_list[find_index] = games_option;
    }

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(games_list));

    notice(games_option);
    onClose(); // 关闭弹窗
  };

  const a = () => {
    new Promise(() => {});
    // try {
    //   playSuitApi.speedInfo({
    //         platform: 3,
    //         gid: options?.id,
    //         pid: key,
    //       })
    // } catch (error) {

    // }
  };

  const handleMethod = async () => {
    try {
      let res = await playSuitApi.pcPlatform(); // 请求运营平台接口
      let platform_list = Object?.keys(res?.data) || []; // 运营平台数据
      let api_list: any = []; // 需要请求的api 数量
      console.log(res);

      // 对api数量进行处理
      platform_list.forEach((key: string) => {
        api_list.push(
          playSuitApi.speedInfo({
            platform: 3,
            gid: options?.id,
            pid: key,
          })
        );
      });

      const data: any = await Promise.all(api_list); // 请求等待统一请求完毕
      // console.log(data);

      // 聚合所以的api 数据中的 游戏平台
      const result_excutable = data.reduce((acc: any, item: any) => {
        if (item?.data?.pc_platfrom === "") {
          return acc.concat(item.data.executable);
        }
        return acc;
      }, []);

      setPlatforms(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const clickSelectPlatform = async (e: string) => {
    try {
      let res = await playSuitApi.speedInfo({
        platform: 3,
        gid: options?.id,
        pid: e,
      });

      setSelectPlatform(e);
      setFilePath(res?.data?.start_path);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (open) {
      handleMethod();
    }
  }, [open]);

  return (
    <Modal
      className="activation-modal"
      open={open}
      onCancel={onClose}
      title="启动方式"
      width={"40vw"}
      centered
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <div className="activation-modal-content">
        <div className="content-title">启动平台：</div>
        <Select
          className="content-select"
          value={selectPlatform}
          onChange={(e) => clickSelectPlatform(e)}
        >
          {Object?.keys(platforms)?.length > 0 &&
            Object?.keys(platforms)?.map((key: any) => {
              return (
                <Option value={key} key={key}>
                  {key === "0" ? "自定义" : platforms?.[key]}
                </Option>
              );
            })}
        </Select>
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
        </div>
        <Button className="save-btn" type="default" onClick={handleSave}>
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default ActivationModal;
