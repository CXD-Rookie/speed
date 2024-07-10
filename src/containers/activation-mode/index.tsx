/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-07-10 16:50:58
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

  const [filePath, setFilePath] = useState(); // 启动路径
  const [selectPlatform, setSelectPlatform] = useState<string>(); // 选择的游戏平台

  const [platforms, setPlatforms] = useState<any>([]); // 所有的运营平台

  const handleInputChange = () => {
    new Promise((resolve, reject) => {
      (window as any).NativeApi_AsynchronousRequest(
        "NativeApi_SelectFilePath",
        "",
        function (response: any) {
          const isCheck = JSON.parse(response);

          if (isCheck?.path) {
            console.log("获取返回路径:", response);
            setFilePath(isCheck.path);
          } else {
            console.error("Query failed:", response);
          }
        }
      );
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

  // 处理请求 游戏平台信息
  const fetchGamePlatformDetails = (option: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await playSuitApi.speedInfo({
          platform: 3,
          gid: options?.id,
          pid: option?.pid,
        });
        // 成功回调
        resolve({
          state: true,
          data: {
            ...res?.data,
            option,
          },
        });
      } catch (error) {
        // 失败回调
        reject({
          state: false,
          // response: { errorCode, errorMessage },
        });
      }
    });
  };

  const handleMethod = async () => {
    try {
      let res = await playSuitApi.pcPlatform(); // 请求运营平台接口
      let platform_list = Object?.keys(res?.data) || []; // 运营平台数据
      let api_list: any = []; // 需要请求的api 数量

      // 对api数量进行处理
      platform_list.forEach((key: string) => {
        api_list.push(
          fetchGamePlatformDetails({ pid: key, name: res?.data?.[key] })
        );
      });

      const data: any = await Promise.all(api_list); // 请求等待统一请求完毕
      // 聚合所以的api 数据中的 游戏平台
      let result_excutable = data.reduce((acc: any = [], item: any) => {
        let data = item?.data;

        if (Number(data?.pc_platform) === Number(data?.option?.pid)) {
          return acc.concat([
            {
              pc_platform: data?.pc_platform,
              path: data?.start_path,
              ...data?.option,
            },
          ]);
        }
        return acc;
      }, []);

      result_excutable =
        result_excutable?.length > 0
          ? result_excutable
          : [
              {
                pc_platform: 0,
                path: "",
                pid: "0",
                name: "-",
              },
            ];

      setPlatforms(result_excutable);
      return result_excutable;
    } catch (error) {
      console.log(error);
    }
  };

  const clickSelectPlatform = async (e: string) => {
    let path = platforms.filter((item: any) => item?.pid === e)?.[0];

    setSelectPlatform(e);
    setFilePath(path?.path || "");
  };

  useEffect(() => {
    const initialFetch = async () => {
      let default_info = await handleMethod();

      if (default_info) {
        let info = options?.activation_method;
        let pid, path;

        if (info) {
          pid = info?.select_platforms_id;
          path = info?.filePath;
        } else {
          let arr = default_info.filter((item: any) => item?.pid !== "0"); // 查找不是自定义的平台
          let is_true = arr?.length > 0; // 是否找到不是自定义的平台

          pid = is_true ? arr?.[1]?.pid : default_info?.[0]?.pid;
          path = is_true ? arr?.[1]?.path : default_info?.[0]?.path;
        }

        setSelectPlatform(pid);
        setFilePath(path);
      }
    };

    if (open) {
      initialFetch();
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
          {platforms?.length > 0 &&
            platforms.map((item: any) => {
              return (
                <Option value={item?.pid} key={item?.pid}>
                  {String(item?.pid) === "0" ? "自定义" : item?.name}
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
