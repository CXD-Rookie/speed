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
  const [selectedRegion, setSelectedRegion] = useState(); // 当前命中区服

  const [selectedNode, setSelectedNode] = useState("0418 亚洲网20");
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);

  const [regions, setRegions] = useState([]); // 区服列表
  const [selectRegions, setSelectRegions] = useState([]); // 选择过的区服列表

  const [regionDomList, setRegionDomList] = useState(); // 节点列表

  const [listenerNode, setListenerNode] = useState(0);

  const handleNodeClick = (node: {
    key: string;
    ip: string;
    server: { port: number }[];
  }) => {
    setSelectedNodeKey(node?.key);
    console.log("Selected node:", node);
    const requestData = JSON.stringify({
      method: "NativeApi_GetIpDelay",
      params: { ip: node.ip, port: node.server[0].port },
    });

    (window as any).cefQuery({
      request: requestData,
      onSuccess: (response: any) => {
        console.log("Response from C++:", response);
        const jsonResponse = JSON.parse(response); //{"delay":32(这个是毫秒,9999代表超时与丢包)}
      },
      onFailure: (errorCode: any, errorMessage: any) => {
        console.error("Query failed:", errorMessage);
      },
    });
  };

  // 获取游戏区服列表
  const handleSuitList = async () => {
    try {
      let res = await playSuitApi.playSuitList();
      console.log("获取游戏区服列表", res);
      setRegions(res?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // 选择区服
  const handleSelectRegion = (region: any) => {
    let arr: any = [...selectRegions];
    console.log("选择区服参数：", region);
    // 去重 添加
    if (!arr.some((item: any) => item?.id === region?.id)) {
      arr.push(region);
    }

    // 选择当前区服
    arr = arr.map((item: any) => {
      return { ...item, is_select: item?.id === region?.id };
    });

    console.log("当前区服列表历史记录", arr); // 已选择区服列表
    localStorage.setItem("speed-1.0.0.1-region", JSON.stringify(arr));
    setListenerNode(listenerNode + 1);
    // onCancel();
  };

  const handleSuitDomList = async () => {
    try {
      let res = await playSuitApi.playSpeedList({
        platform: 3,
        nid: selectedRegion,
      });
      console.log("获取节点列表", res);
  
      // 给每一项添加 delay, lostBag 和 type 属性
      const modifiedData = res?.data.map((item:any) => ({
        ...item,
        delay: 9999,
        packetLoss: 10,
        mode: "进程模式",
      }));
  
      setRegionDomList(modifiedData || []);
    } catch (error) {
      console.log(error);
    }
  };

// const handleSuitDomList = async () => {
//     try {
//       let res = await playSuitApi.playSpeedList({
//         platform: 3,
//         nid: selectedRegion,
//       });
//       console.log("获取节点列表", res);
  
//       const nodes = res?.data || [];
  
//       // 创建一个新的Promise数组，以便等待所有异步操作完成
//       const updatedNodes = await Promise.all(nodes.map(async (node: any) => {
//         const requestData = JSON.stringify({
//           method: "NativeApi_GetIpDelay",
//           params: { ip: node.ip, port: node.server[0].port },
//         });
  
//         return new Promise<any>((resolve, reject) => {
//           (window as any).cefQuery({
//             request: requestData,
//             onSuccess: (response: any) => {
//               console.log("Response from C++:", response);
//               const jsonResponse = JSON.parse(response);
//               resolve({
//                 ...node,
//                 delay: jsonResponse.delay,
//                 packetLoss: 10,
//                 mode: "进程模式",
//               });
//             },
//             onFailure: (errorCode: any, errorMessage: any) => {
//               console.error("Query failed:", errorMessage);
//               resolve({
//                 ...node,
//                 delay: 9999, // 处理失败的情况，设为9999
//                 packetLoss: 10,
//                 mode: "进程模式",
//               });
//             },
//           });
//         });
//       }));
  
//       // 更新 state
//       //@ts-ignore
//       setRegionDomList(updatedNodes);
//     } catch (error) {
//       console.log(error);
//     }
//   };
  

  // 切换tab
  const handleTabsChange = (e: any) => {
    console.log("切换tab", e);

    if (e === "2") {
      handleSuitDomList();
    }
  };

  useEffect(() => {
    handleSuitList();
  }, []);

  useEffect(() => {
    if (visible) {
      let arr: any = localStorage.getItem("speed-1.0.0.1-region");

      arr = arr ? JSON.parse(arr) : [];
      let result = arr.filter((item: any) => item?.is_select);

      setSelectedRegion(result?.[0]?.id || "");
      setSelectRegions(arr);
    }
  }, [visible, selectedRegion, listenerNode]);

  return (
    <Modal
      title="区服、节点选择"
      open={visible}
      onCancel={onCancel}
      destroyOnClose
      footer={null}
      className="region-node-selector"
    >
      <Tabs defaultActiveKey="1" onChange={handleTabsChange}>
        <TabPane tab="区服" key="1">
          <div className="content">
            <div className="current-box">
              <div className="current-game">英雄联盟大吉大利</div>
              <div className="current-region">
                当前区服:
                <Select
                  className="region-select"
                  defaultValue={selectedRegion}
                  onChange={(value) => setSelectedRegion(value)}
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

            <div className="not-have-region">没有找到区服？</div>
          </div>
        </TabPane>
        <TabPane tab="节点" key="2">
          <div className="content">
            <div className="current-settings">
              英雄联盟大吉大利 | {selectedRegion}
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
              rowKey="id"
              dataSource={regionDomList}
              pagination={false}
              rowClassName={(record) =>
                record.id === selectedNodeKey ? "selected-node" : ""
              }
              onRow={(record) => ({
                onClick: () =>
                  handleNodeClick(
                    record as {
                      id: any;
                      key: string;
                      ip: string;
                      server: { port: number }[];
                    }
                  ),
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
