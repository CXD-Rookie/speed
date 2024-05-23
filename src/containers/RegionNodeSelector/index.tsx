import React, { useEffect, useState } from "react";
import { Modal, Tabs, Select, Button, Table } from "antd";

import "./index.scss";
import playSuitApi from "@/api/speed";

const { TabPane } = Tabs;
const { Option } = Select;
const { Column } = Table;

interface RegionNodeSelectorProps {
  visible: boolean;
  onCancel: () => void;
}

const RegionNodeSelector: React.FC<RegionNodeSelectorProps> = ({
  visible,
  onCancel,
}) => {
  const [selectedRegion, setSelectedRegion] = useState();
  const [selectedMode, setSelectedMode] = useState("路由模式");
  const [selectedNode, setSelectedNode] = useState("0418 亚洲网20");
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);

  const [regions, setRegions] = useState([]);
  const [selectRegions, setSelectRegions] = useState([]);

  const nodes = [
    {
      key: "1",
      name: "北京-A1234",
      delay: "56ms",
      packetLoss: "60%",
      mode: "进程模式",
    },
    {
      key: "2",
      name: "北京-A1234",
      delay: "98ms",
      packetLoss: "80%",
      mode: "路由模式",
    },
    {
      key: "3",
      name: "北京-A1234",
      delay: "98ms",
      packetLoss: "80%",
      mode: "进程模式",
    },
    {
      key: "4",
      name: "北京-A1234",
      delay: "98ms",
      packetLoss: "80%",
      mode: "路由模式",
    },
    {
      key: "5",
      name: "北京-A1234",
      delay: "98ms",
      packetLoss: "80%",
      mode: "进程模式",
    },
  ];

  const handleNodeClick = (node: (typeof nodes)[0]) => {
    setSelectedNodeKey(node.key);
    console.log("Selected node:", node);
  };

  // 获取游戏区服列表
  const handleSuitList = async () => {
    try {
      let res = await playSuitApi.playSuitList();

      setRegions(res?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // 选择区服
  const handleSelectRegion = (region: any) => {
    let arr: any = [...selectRegions];
    console.log("选择区服", region);

    // 去重 添加
    if (!arr.some((item: any) => item?.id === region?.id)) {
      arr.push(region);
    }

    // 选择当前区服
    arr = arr.map((item: any) => {
      return { ...item, is_select: item?.id === region?.id };
    });

    localStorage.setItem("speed-1.0.0.1-region", JSON.stringify(arr));
    onCancel();
  };

  useEffect(() => {
    handleSuitList();
  }, []);

  useEffect(() => {
    let arr: any = localStorage.getItem("speed-1.0.0.1-region");

    arr = arr ? JSON.parse(arr) : [];
    let result = arr.filter((item: any) => item?.is_select);

    setSelectedRegion(result?.[0]?.id || "");
    setSelectRegions(arr);
  }, []);

  return (
    <Modal
      title="区服、节点选择"
      visible={visible}
      onCancel={onCancel}
      destroyOnClose
      footer={null}
      className="region-node-selector"
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="区服" key="1">
          <div className="content">
            <div className="current-game">当前游戏: 英雄联盟大吉大利</div>
            <div className="current-region">
              当前区服:
              <Select
                defaultValue={selectedRegion}
                onChange={(value) => setSelectedRegion(value)}
                className="region-select"
              >
                {selectRegions.map((item: any) => {
                  return (
                    <Option key={item?.id} value={item?.id}>
                      {item?.region}
                    </Option>
                  );
                })}
              </Select>
            </div>
            <div className="region-buttons">
              {Object.entries(regions).map(([key, value]) => (
                <Button
                  key={key}
                  className="region-button"
                  onClick={() => handleSelectRegion({ id: key, region: value })}
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="no-region">请先选择游戏区服</div>
          </div>
        </TabPane>
        <TabPane tab="节点" key="2">
          <div className="content">
            <div className="current-settings">
              <span>当前游戏: 英雄联盟大吉大利 | {selectedRegion}</span>
            </div>
            <div className="mode-select">
              模式选择:
              <Select
                defaultValue={selectedMode}
                onChange={(value) => setSelectedMode(value)}
              >
                <Option value="路由模式">路由模式</Option>
                <Option value="进程模式">进程模式</Option>
              </Select>
            </div>
            <div className="node-select">
              节点记录:
              <Select
                defaultValue={selectedNode}
                onChange={(value) => setSelectedNode(value)}
              >
                <Option value="0418 亚洲网20">0418 亚洲网20</Option>
              </Select>
              <Button className="refresh-button">刷新</Button>
            </div>
            <Table
              dataSource={nodes}
              pagination={false}
              rowClassName={(record) =>
                record.key === selectedNodeKey ? "selected-node" : ""
              }
              onRow={(record) => ({
                onClick: () => handleNodeClick(record),
              })}
              className="nodes-table"
            >
              <Column title="节点" dataIndex="name" key="name" />
              <Column title="游戏延迟" dataIndex="delay" key="delay" />
              <Column title="丢包" dataIndex="packetLoss" key="packetLoss" />
              <Column title="模式" dataIndex="mode" key="mode" />
            </Table>
            <Button type="primary" className="start-button">
              开始加速
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default RegionNodeSelector;
