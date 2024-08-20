import { useState, useEffect } from "react";
import { Modal, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";
import playSuitApi from "@/api/speed";
import CustomRegion from "./region";

interface RegionNodeSelectorProps {
  open: boolean;
  type?: string;
  options: any;
  stopSpeed?: () => void;
  onCancel: () => void;
  notice?: (value: any) => void;
}

interface RegionProps {
  fu?: string;
  qu?: string;
  suit?: string;
  is_select?: boolean;
}

const iniliteSmart = {
  fu: "",
  qu: "智能匹配",
  suit: "智能匹配", // 智能匹配在此游戏是国服游戏时传值国服，其他查询全部
  is_select: false, // 是否选择当前区服
};

const CustomRegionNode: React.FC<RegionNodeSelectorProps> = ({
  options,
  open,
  type = "details",
  onCancel,
  notice = () => {},
}) => {
  const { getGameList, identifyAccelerationData, removeGameList } =
    useGamesInitialize();

  const [activeTab, setActiveTab] = useState("region"); // tab栏值

  const [presentGameData, setPresentGameInfo] = useState<any>({}); // 当前期望加速的游戏信息
  const [currentGameServer, setCurrentGameServer] = useState([]); // 当前游戏的区服

  // 更新存储，展示的当前的游戏区服
  const refreshAndShowCurrentServer = (info: any) => {
    let game_list = getGameList(); // 获取应用存储的游戏列表
    let find_index = game_list.findIndex((item: any) => item?.id === info?.id);

    setPresentGameInfo(info); // 更新当前游戏信息

    if (find_index !== -1) {
      game_list[find_index] = info;
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
    }
  };

  // 更新游戏历史选择区服
  const updateGamesRegion = (info: any = {}, event: RegionProps = {}) => {
    const result = { ...info };
    const { serverNode = {}, playsuit = 2 } = result; // 获取当前游戏数据的区服

    // 如果当前没有游戏没有选择过区服 则进行默认选择 智能匹配
    if (!serverNode?.region) {
      result.serverNode = {
        region: [
          {
            ...iniliteSmart,
            suit: playsuit === 2 ? "国服" : "智能匹配", // 智能匹配在此游戏是国服游戏时传值国服，其他查询全部
            is_select: true, // 是否选择当前区服
          }
        ],
      };
    }

    // 点击新区服进行添加到历史记录
    if (Object?.keys(event)?.length > 0) {
      let find_index = serverNode.region.findIndex(
        (item: any) => item?.qu === event?.qu
      );

      // 删除重复数据
      if (find_index !== -1) {
        result.serverNode.region.splice(find_index, 1);
      }

      // 删除超出10个以后数据
      if (serverNode.region?.length >= 10) {
        result.serverNode.region.splice(10);
      }

      result.serverNode.region = [
        {
          ...event,
          suit: playsuit === 2 ? "国服" : event?.qu, // 智能匹配在此游戏是国服游戏时传值国服，其他查询全部
          is_select: true, // 是否选择当前区服
        },
        ...[
          ...serverNode.region.map((item: any) => ({
            ...item,
            is_select: false,
          })),
        ],
      ];
    }

    refreshAndShowCurrentServer(result);
    return result;
  };

  // 获取每个区服的子区服列表
  const handleSubRegions = async (select: any = {}) => {
    try {
      let res = await playSuitApi.playSuitInfo({
        system_id: 3,
        gid: options?.id,
      });
      let data = res?.data || [];

      data.unshift({
        fu: "",
        qu: "智能匹配",
        gid: options?.id,
        system_id: 3,
      });

      // if (select?.fu) {
      //   let panel = data.filter((item: any) => item?.qu === select?.fu);

      //   setExpandedPanels(panel?.[0] || {});
      // }

      setCurrentGameServer(data);
    } catch (error) {
      console.log(error);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "region",
      label: "区服",
      children: (
        <CustomRegion
          open={open}
          value={presentGameData}
          currentGameServer={currentGameServer}
          updateGamesRegion={updateGamesRegion}
        />
      ),
    },
    {
      key: "node",
      label: "节点",
      children: "Content of Tab Pane 2",
    },
  ];

  useEffect(() => {
    if (open) {
      handleSubRegions();
      updateGamesRegion(options); // 检测是否有选择过的区服, 有就取值，没有就进行默认选择
    }
  }, [open]);

  return (
    <Modal
      className="region-node-selector"
      title="区服、节点选择"
      width={"67.6vw"}
      open={open}
      maskClosable={false}
      footer={null}
      centered
      destroyOnClose
      onCancel={onCancel}
    >
      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key: string) => setActiveTab(key)}
      />
    </Modal>
  );
}

export default CustomRegionNode;