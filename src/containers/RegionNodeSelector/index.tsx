import React, { useEffect, useState } from "react";
import { Modal, Tabs, Select, Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";

import "./index.scss";
import playSuitApi from "@/api/speed";

const { TabPane } = Tabs;
const { Option } = Select;
const { Column } = Table;

interface RegionNodeSelectorProps {
  open: boolean;
  options: any;
  detailData?: any;
  onCancel: () => void;
  onSelect?: (value: any) => void;
}

const RegionNodeSelector: React.FC<RegionNodeSelectorProps> = ({
  detailData,
  options,
  open,
  onCancel,
  onSelect,
}) => {
  const navigate = useNavigate();

  const { getGameList, identifyAccelerationData } = useGamesInitialize();

  const [selectedNode, setSelectedNode] = useState<any>();
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [regionDomList, setRegionDomList] = useState(); // 节点列表
  const [regionDomHistory, setRegionDomHistory] = useState(); // 节点历史

  const [regions, setRegions] = useState([]); // 区服列表
  //@ts-ignore
  const [subRegions, setSubRegions] = useState<{ [key: string]: SubRegion[] }>(
    {}
  );
  const [selectRegions, setSelectRegions] = useState([]); // 选择过的区服列表
  const [selectValue, setSelectValue] = useState<any>(""); // 当前选择的区服id
  const [selectInfo, setSelectInfo] = useState<any>({}); // 当前选择的区服信息
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const handleNodeClick = (node: {
    key: string;
    ip: string;
    server: { port: number }[];
  }) => {
    setSelectedNodeKey((node as any)?.id);
    setSelectedNode(node);
    console.log("Selected node:", node);
  };

  // const togglePanel = (panelKey: string) => {
  //   if (expandedPanels.includes(panelKey)) {
  //     setExpandedPanels(expandedPanels.filter((key) => key !== panelKey));
  //   } else {
  //     setExpandedPanels([...expandedPanels, panelKey]);
  //   }
  // };

  const togglePanel = (panelKey: string) => {
    if (expandedPanels.includes(panelKey)) {
      setExpandedPanels([]);
    } else {
      setExpandedPanels([panelKey]);
    }
  };

  // 获取每个区服的子区服列表
  const handleSubRegions = async () => {
    try {
      let res = await playSuitApi.playSuitInfo({
        system_id: 3,
        gid: localStorage.getItem("speedGid"),
      });
      const subRegionsData = res?.data || [];
      const subRegionsMap = subRegionsData.reduce((acc: any, region: any) => {
        if (region.children && region.children.length > 0) {
          acc[region.qu] = region.children;
        } else {
          acc[region.qu] = [];
        }
        return acc;
      }, {});
      setSubRegions(subRegionsMap);
      setRegions(
        subRegionsData.map((region: any) => ({
          id: region.qu,
          name: region.qu,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  // 更新游戏默认选择区服
  const updateGamesRegion = () => {
    let game_list: any = getGameList(); // 我的游戏列表

    if (game_list?.length > 0 && game_list instanceof Array) {
      game_list = game_list.map((game: any) => {
        let region = game?.select_region || [];

        if (region?.length < 1) {
          region = [{ id: "2", region: "国服", is_select: true }];
        } else {
          let find_index = region.findIndex((select: any) => select?.is_select);

          if (find_index === -1) {
            region = region.map((item: any) => ({
              ...item,
              is_select: item?.id === "2",
            }));
          }
        }

        return {
          ...game,
          select_region: region,
        };
      });
    }

    let accel_obj = identifyAccelerationData(game_list)?.[1] || {};
    let select_arr = accel_obj?.select_region || [];
    let result = select_arr.filter((item: any) => item?.is_select);

    setSelectValue(result?.[0]?.id);
    setSelectInfo(result?.[0]);
    setSelectRegions(select_arr);

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
  };

  // 选择区服旧逻辑
  const handleSelectRegion = (region: any) => {
    let arr: any = getMyGames(); // 我的游戏列表
    let acc_arr = arr.filter((item: any) => item?.is_accelerate); // 当前加速游戏的数据
    let region_arr = acc_arr?.[0]?.select_region || []; // 当前加速游戏的历史区服列表

    console.log("选择区服参数：", region);
    // 去重 添加
    if (!region_arr.some((item: any) => item?.id === region?.id)) {
      region_arr.push(region);
    }

    // 选择当前区服
    region_arr = region_arr.map((item: any) => {
      return { ...item, is_select: item?.id === region?.id };
    });

    // 更新当前区服列表
    acc_arr[0].select_region = region_arr;

    setSelectRegions(region_arr);
    setSelectValue(region?.id);
    setSelectInfo(region);
    //@ts-ignore
    onSelect(region); // 将选中数据返回上级

    // 更新我的游戏
    let arr_index = arr.findIndex((item: any) => item?.is_accelerate);

    arr[arr_index] = acc_arr[0];
    arr = arr.map((item: any) => ({ ...item, is_accelerate: false }));

    localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));

    onCancel();

    // 跳转到首页并触发自动加速autoAccelerate
    navigate("/home", {
      state: {
        isNav: true,
        data: {
          ...acc_arr[0],
          router: "details",
        },
        autoAccelerate: true,
      },
    });
  };

  const handleSuitDomList = async () => {
    try {
      let res = await playSuitApi.playSpeedList({
        platform: 3,
        nid: selectValue,
      });
      console.log("获取节点列表", res);

      const nodes = res?.data || [];

      // 创建一个新的Promise数组，以便等待所有异步操作完成
      const updatedNodes = await Promise.all(
        nodes.map(async (node: any) => {
          const requestData = JSON.stringify({
            method: "NativeApi_GetIpDelayByICMP",
            params: { ip: node.ip },
          });

          return new Promise<any>((resolve, reject) => {
            (window as any).cefQuery({
              request: requestData,
              onSuccess: (response: any) => {
                console.log("Response from C++:", response);
                const jsonResponse = JSON.parse(response);
                resolve({
                  ...node,
                  delay: jsonResponse.delay,
                  packetLoss: 10,
                  mode: "进程模式",
                });
              },
              onFailure: (errorCode: any, errorMessage: any) => {
                console.error("Query failed:", errorMessage);
                resolve({
                  ...node,
                  delay: 9999, // 处理失败的情况，设为9999
                  packetLoss: 10,
                  mode: "进程模式",
                });
              },
            });
          });
        })
      );

      // 更新 state
      //@ts-ignore
      setRegionDomList(updatedNodes);
    } catch (error) {
      console.log(error);
    }
  };

  // 切换tab
  const handleTabsChange = (e: any) => {
    if (e === "2") {
      let arr = detailData?.dom_history || [];

      setRegionDomHistory(arr);
      handleSuitDomList();
    }
  };

  // 开始加速
  const clickStartOn = () => {
    // 当前选中的节点 selectedNode
    let arr: any = getMyGames(); // 我的游戏列表
    let acc_arr = arr.filter((item: any) => item?.is_accelerate); // 当前加速游戏的数据
    let region_arr = acc_arr?.[0]?.dom_history || []; // 当前加速游戏的历史区服列表

    console.log("选择节点参数：", selectedNode);
    // 去重 添加
    if (!region_arr.some((item: any) => item?.id === selectedNode?.id)) {
      region_arr.push(selectedNode);
    }

    // 选择当前节点
    region_arr = region_arr.map((item: any) => {
      return { ...item, is_select: item?.id === selectedNode?.id };
    });

    // 更新当前区服列表
    acc_arr[0].dom_history = region_arr;

    setRegionDomHistory(region_arr);

    // 更新我的游戏
    let arr_index = arr.findIndex((item: any) => item?.is_accelerate);

    arr[arr_index] = acc_arr[0];
    arr = arr.map((item: any) => ({ ...item, is_accelerate: false }));

    // localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(arr));

    // 跳转到首页并触发自动加速autoAccelerate
    navigate("/home", {
      state: {
        isNav: true,
        data: {
          ...detailData,
          router: "details",
        },
        autoAccelerate: true,
      },
    });
  };

  useEffect(() => {
    updateGamesRegion();
  }, []);

  useEffect(() => {
    handleSubRegions(); // 改为调用 handleSubRegions 初始化
  }, []);

  return (
    <Modal
      className="region-node-selector"
      open={open}
      title="区服、节点选择"
      destroyOnClose
      width={"67.6vw"}
      centered
      maskClosable={false}
      footer={null}
      onCancel={onCancel}
    >
      <Tabs defaultActiveKey="1" onChange={handleTabsChange}>
        <TabPane tab="区服" key="1">
          <div className="content">
            <div className="current-box">
              <div className="current-game">{detailData?.name}</div>
              <div className="current-region">
                当前区服:
                <Select
                  className="region-select"
                  value={selectValue}
                  onChange={(value) => {
                    let arr: any = selectRegions.filter(
                      (child: any) => child?.id === value
                    );
                    setSelectValue(value);
                    handleSelectRegion({ id: value, region: arr?.[0]?.region });
                  }}
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
              {regions
                .filter((region: any) => subRegions[region.name]?.length > 0) // 过滤出有子区域的父级区域
                .map((region: any) => (
                  <div>
                    <Button
                      onClick={() => togglePanel(region.id)}
                      className="region-button"
                      style={{ marginBottom: 8 }}
                    >
                      {/* {region.name} <DownOutlined /> */}
                      {region.name}{" "}
                      {/* {expandedPanels.includes(region.id) ? <UpOutlined /> : <DownOutlined />} */}
                      <span
                        className={
                          expandedPanels.includes(region.id)
                            ? "up-triangle"
                            : "down-triangle"
                        }
                      ></span>
                    </Button>
                  </div>
                ))}
            </div>
            <div className="sub-btns">
              {regions
                .filter((region: any) => subRegions[region.name]?.length > 0) // 过滤出有子区域的父级区域
                .map((region: any) => (
                  <div>
                    {expandedPanels.includes(region.id) && (
                      <div>
                        {subRegions[region.name]?.map((subRegion: any) => (
                          <Button
                            key={subRegion.qu}
                            className="region-button"
                            onClick={() => handleSelectRegion(subRegion)}
                          >
                            {subRegion.qu}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="not-have-region">没有找到区服？</div>
          </div>
        </TabPane>
        <TabPane tab="节点" key="2">
          <div className="content">
            <div className="current-settings">
              {detailData?.name} | {selectInfo?.region}
            </div>
            <div className="node-select">
              <div>
                <span>节点记录:</span>
                <Select
                  onChange={(value) => {
                    setSelectedNodeKey(value);
                  }}
                >
                  {(regionDomHistory as any)?.length > 0 &&
                    (regionDomHistory as any).map((item: any) => {
                      return (
                        <Option key={item?.id} value={item?.id}>
                          {item?.name}
                        </Option>
                      );
                    })}
                </Select>
              </div>

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
            <Button
              type="primary"
              className="start-button"
              onClick={clickStartOn}
            >
              开始加速
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default RegionNodeSelector;
