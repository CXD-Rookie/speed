/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:57:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-30 16:40:32
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\activation-mode\index.tsx
 */
import React, { useState } from "react";
import { Modal, Button, Select } from "antd";

import "./index.scss";

const { Option } = Select;

interface ActivationModalProps {
  isOpen?: boolean;
  gameId: string;
  onClose: () => void;
}

interface Game {
  id: string;
  name: string;
  name_en: string;
  cover_img: string;
  background_img: string;
  icon: string;
  note: string;
  description: string;
  developer: string;
  playsuit: number;
  pack_name: string;
  screen_shot: any;
  system_id: number[];
  pc_platform: number[];
  download: { android: string };
  site: string;
  tags: string[];
  game_more: {
    news: string;
    guide: string;
    store: string;
    bbs: string;
    mod: string;
    modifier: string;
  };
  create_time: number;
  update_time: number;
  is_accelerate: boolean;
  start_path?: string;
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen = true,
  gameId,
  onClose,
}) => {
  const [filePath, setFilePath] = useState(""); // 启动路径
  const [game, setGame] = useState<Game | null>(null);

  const handleInputChange = () => {
    console.log("打开路径=====================", gameId);

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
    console.log("点击报存");
    // 这个逻辑需要在打开文件之后回调处理，这是保存的逻辑
    const gamesListString = localStorage.getItem("speed-1.0.0.1-games");
    if (gamesListString) {
      try {
        const gamesList: Game[] = JSON.parse(gamesListString);
        const gameDetail = gamesList.find((game) => game.id === gameId); // 使用传递进来的 gameId

        if (gameDetail) {
          gameDetail.start_path = filePath; // 添加 start_path 属性
          console.log(11111111111111111);
          localStorage.setItem(
            "speed-1.0.0.1-games",
            JSON.stringify(gamesList)
          );
          setGame(gameDetail); // 更新本地状态
          onClose(); // 关闭弹窗
        }
      } catch (error) {
        console.error("Failed to parse gamesList from localStorage", error);
      }
    }
  };

  return (
    <Modal
      className="activation-modal"
      open={isOpen} //isOpen
      onCancel={onClose}
      title="启动方式"
      width={"40vw"}
      centered
      maskClosable={false}
      footer={null}
    >
      <div className="activation-modal-content">
        <div className="content-title">启动平台：</div>
        <Select className="content-select" defaultValue={"Steam"}>
          <Option value="Steam">Steam</Option>
        </Select>
        <div className="content-title">启动路径：{filePath}</div>
        <div className="btn-box">
          <Button className="content-btn" onClick={handleInputChange}>
            浏览
          </Button>
          <Button className="content-btn" type="default" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivationModal;
