import React, { Fragment, useEffect, useState } from "react";
import { Modal, Tabs, Select, Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";

import "./index.scss";
import playSuitApi from "@/api/speed";
import useCefQuery from "@/hooks/useCefQuery";
import BreakConfirmModal from "../break-confirm";
import IssueModal from "@/containers/IssueModal/index";

const { TabPane } = Tabs;
const { Option } = Select;
const { Column } = Table;

interface RegionNodeSelectorProps {
  open: boolean;
  type?: string;
  options: any;
  stopSpeed?: () => void;
  onCancel: () => void;
  notice?: (value: any) => void;
}

const RegionNodeSelector: React.FC<RegionNodeSelectorProps> = ({
  options,
  open,
  type = "details",
  onCancel,
  stopSpeed = () => {},
  notice = () => {},
}) => {
  const navigate = useNavigate();

  const { getGameList, identifyAccelerationData, removeGameList } =
    useGamesInitialize();

  const sendMessageToBackend = useCefQuery();
  const historyContext: any = useHistoryContext();

  const [presentGameInfo, setPresentGameInfo] = useState<any>({}); // 当前期望加速的游戏信息

  const [activeTab, setActiveTab] = useState("1"); // tab栏值

  const [domHistory, setDomHistory] = useState<any>([]); // 节点历史信息
  const [regionDomList, setRegionDomList] = useState(); // 节点列表
  const [selectedNode, setSelectedNode] = useState<any>(
    options?.dom_info?.select_dom
  ); // 当前点击列表触发的节点

  const [subRegions, setSubRegions] = useState<any>({}); // 区服信息列表
  const [regions, setRegions] = useState([]); // 区服列表
  const [regionInfo, setRegionInfo] = useState<any>({}); // 当前选择的区服信息

  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const [accelOpen, setAccelOpen] = useState(false); // 加速确认
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

  const [issueDescription, setIssueDescription] = useState<string | null>(null); // 添加状态控制 IssueModal 的默认描述

  const togglePanel = (panelKey: string) => {
    if (expandedPanels.includes(panelKey)) {
      setExpandedPanels([]);
    } else {
      setExpandedPanels([panelKey]);
    }
  };

  // 更新游戏历史选择节点
  const updateGamesDom = (option: any = {}) => {
    let old_dom = presentGameInfo?.dom_info?.dom_history || []; // 现在已存在的数据
    let isTrue = old_dom.some((item: any) => item?.id === option?.id); // 现在已有的历史节点是否包含当前选择的节点

    let dom_info = {
      select_dom: option,
      dom_history: isTrue ? old_dom : [...old_dom, option],
    };

    let game_list = getGameList();
    let find_index = game_list.findIndex(
      (item: any) => item?.id === presentGameInfo?.id
    );
    let game_info = {
      ...presentGameInfo,
      dom_info,
    };

    setDomHistory(dom_info); // 更新当前节点信息
    setPresentGameInfo(game_info); // 更新当前游戏信息

    if (find_index !== -1) {
      game_list[find_index] = game_info;

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
    }

    return dom_info;
  };

  // 开始加速
  const clickStartOn = async (node = selectedNode) => {
    let domInfo = updateGamesDom(node);

    // await playSuitApi.playSpeedEnd({
    //   platform: 3,
    //   js_key: localStorage.getItem("StartKey"),
    // }); // 游戏加速信息

    sendMessageToBackend(
      JSON.stringify({
        method: "NativeApi_StopProxy",
        params: null,
      }),
      (response: any) => {
        console.log("Success response from 停止加速:", response);
        historyContext?.accelerateTime?.stopTimer();

        if ((window as any).stopDelayTimer) {
          (window as any).stopDelayTimer();
        }

        removeGameList("initialize"); // 更新我的游戏

        // 如果是在卡片进行加速的过程中将选择的信息回调到卡片
        if (type === "acelerate") {
          notice({
            ...presentGameInfo,
            dom_info: domInfo,
          });

          navigate("/home");
        } else {
          // 跳转到首页并触发自动加速autoAccelerate
          navigate("/home", {
            state: {
              isNav: true,
              data: {
                ...presentGameInfo,
                dom_info: domInfo,
                router: "details",
              },
              autoAccelerate: true,
            },
          });
        }
      },
      (errorCode: any, errorMessage: any) => {
        console.error("Failure response from 停止加速:", errorCode);
      }
    );

    onCancel();
  };

  // 获取每个区服的子区服列表
  const handleSubRegions = async (gid: string) => {
    try {
      let res = await playSuitApi.playSuitInfo({
        system_id: 3,
        gid,
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

  // 进行节表格数据 延迟 进行组合拼接
  const handleSuitDomList = async (nodes: any = []) => {
    // 创建一个新的Promise数组，以便等待所有异步操作完成
    const updatedNodes: any = await Promise.all(
      nodes.map(async (node: any) => {
        return new Promise<any>((resolve, reject) => {
          let default_node = {
            ...node,
            delay: 9999,
            packetLoss: 10,
            mode: "进程模式",
          };

          sendMessageToBackend(
            JSON.stringify({
              method: "NativeApi_GetIpDelayByICMP",
              params: { ip: node.ip },
            }),
            (response: any) => {
              console.log("Success response from 获取延迟:", response);
              const jsonResponse = JSON.parse(response);

              resolve({
                ...default_node,
                delay: jsonResponse.delay,
              });
            },
            (errorCode: any, errorMessage: any) => {
              console.error("Failure response from 获取延迟:", errorCode);
              resolve(default_node);
            }
          );
        });
      })
    );

    setRegionDomList(updatedNodes);
  };

  // 更新游戏历史选择区服
  const updateGamesRegion = (option: any = {}, select_region: any = {}) => {
    let region = option?.region || {};

    if (!(Object?.keys(region)?.length > 0)) {
      const select_region = {
        id: "smart_match",
        name: "智能匹配",
      };
      region = {
        select_region, // 默认区服 智能匹配
        history_region: [select_region], // 历史选择区服
      };
    }

    // 点击新区服进行添加到历史记录
    if (Object?.keys(select_region)?.length > 0) {
      let history = region?.history_region;
      // 判断是否重复数据
      let find_sort = region?.history_region.findIndex(
        (item: any) => item?.id === select_region?.id
      );

      history = find_sort !== -1 ? history : [...history, select_region];
      region = {
        select_region, // 点击选择的区服
        history_region: history, // 历史选择区服
      };
    }

    let game_list = getGameList();
    let find_index = game_list.findIndex(
      (item: any) => item?.id === option?.id
    );
    let game_info = {
      ...option,
      region,
    };

    setRegionInfo(region); // 更新当前区服信息
    setPresentGameInfo(game_info); // 更新当前游戏信息

    if (find_index !== -1) {
      game_list[find_index] = game_info;

      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
    }

    return region;
  };

  // 初始化获取所有的加速服务器列表
  const fetchAllSpeedList = async (params = {}) => {
    try {
      let res = await playSuitApi.playSpeedList({
        platform: 3,
        ...params,
      });

      handleSuitDomList(res?.data || []); // 进行当前选择的节点的表格数据组合
    } catch (error) {
      console.log("初始化获取所有的加速服务器列表:", error);
    }
  };

  // 切换 tabs 进行区服 节点切换
  const tabsChange = (event: any) => {
    if (event === "2") {
      setDomHistory(presentGameInfo?.dom_info || {});
    }

    setActiveTab(event);
  };

  // 点击 选择区服
  const clickRegion = (option: any, type = "default") => {
    fetchAllSpeedList(); // 暂时只有固定的几个节点，所以直接获取节点就行，不需要传区服id
    tabsChange("2");

    if (type === "custom") {
      updateGamesRegion(presentGameInfo, option);
    } else {
      updateGamesRegion(presentGameInfo, {
        id: option?.fu + option?.qu,
        name: `${option?.fu}${option?.qu && "-" + option?.qu}`,
      });
    }
  };

  useEffect(() => {
    const initializeFetch = async () => {
      let region = updateGamesRegion(options); // 检测是否有选择过的区服, 有就取值，没有就进行默认选择

      setPresentGameInfo(options);
      // 初始化默认选择的区服不是智能匹配
      fetchAllSpeedList(region?.id !== "smart_match" && {});
      handleSubRegions(options?.id); // 改为调用 handleSubRegions 初始化获取所有的区服信息
    };

    if (open) {
      initializeFetch();
    }
  }, [open]);

  return (
    <Fragment>
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
        <Tabs activeKey={activeTab} onChange={tabsChange}>
          <TabPane tab="区服" key="1">
            <div className="content">
              <div className="current-box">
                <div className="current-game">{options?.name}</div>
                <div className="current-region">
                  当前区服:
                  <Select
                    className="region-select"
                    value={regionInfo?.select_region?.id}
                    onChange={(value) =>
                      clickRegion(
                        regionInfo?.history_region?.filter(
                          (child: any) => child?.id === value
                        )?.[0],
                        "custom"
                      )
                    }
                  >
                    {regionInfo?.history_region?.map((item: any) => {
                      return (
                        <Option key={item?.id} value={item?.id}>
                          {item?.name}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
              <div className="region-buttons">
                <div
                  className="smart-match public-button"
                  onClick={() =>
                    clickRegion(
                      {
                        id: "smart_match",
                        name: "智能匹配",
                      },
                      "custom"
                    )
                  }
                >
                  智能匹配
                </div>
                {regions
                  .filter((region: any) => subRegions[region.name]?.length > 0) // 过滤出有子区域的父级区域
                  .map((region: any) => (
                    <Button
                      key={region.id}
                      onClick={() => togglePanel(region.id)}
                      className="region-button public-button"
                      style={{ marginBottom: 8 }}
                    >
                      {region.name}{" "}
                      <span
                        className={
                          expandedPanels.includes(region.id)
                            ? "up-triangle"
                            : "down-triangle"
                        }
                      />
                    </Button>
                  ))}
              </div>
              <div className="sub-btns">
                {regions
                  .filter((region: any) => subRegions[region.name]?.length > 0) // 过滤出有子区域的父级区域
                  .map(
                    (region: any) =>
                      expandedPanels.includes(region.id) &&
                      subRegions[region.name]?.map((subRegion: any) => (
                        <Button
                          key={subRegion.qu}
                          className="region-button"
                          onClick={() => clickRegion(subRegion)}
                        >
                          {subRegion.qu}
                        </Button>
                      ))
                  )}
              </div>
              <div
                className="not-have-region"
                onClick={() => {
                  setShowIssueModal(true);
                  setIssueDescription(`没有找到区服`);
                }}
              >
                没有找到区服？
              </div>
            </div>
          </TabPane>
          <TabPane tab="节点" key="2">
            <div className="content">
              <div className="current-settings">
                {presentGameInfo?.name} | {regionInfo?.select_region?.name}
              </div>
              <div className="node-select">
                <div>
                  <span>节点记录:</span>
                  <Select
                    defaultValue={domHistory?.select_dom?.id}
                    onChange={(id) => {
                      let isFind = identifyAccelerationData()?.[0] || {}; // 当前是否有加速数据
                      let dom = presentGameInfo?.dom_info?.dom_history;
                      let node = dom.filter((value: any) => value?.id === id);

                      if (isFind && type === "details") {
                        setSelectedNode(node?.[0]);
                        setAccelOpen(true);
                      } else {
                        clickStartOn(node?.[0]);
                      }
                    }}
                  >
                    {domHistory?.dom_history?.length > 0 &&
                      domHistory?.dom_history?.map((item: any) => {
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
                  record.id === selectedNode?.id ? "selected-node" : ""
                }
                onRow={(record) => ({
                  onClick: () => setSelectedNode(record),
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
                onClick={() => {
                  let isFind = identifyAccelerationData()?.[0] || {}; // 当前是否有加速数据
                  if (isFind && type === "details") {
                    setAccelOpen(true);
                  } else {
                    clickStartOn();
                  }
                }}
              >
                开始加速
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
      <BreakConfirmModal
        accelOpen={accelOpen}
        type={"accelerate"}
        setAccelOpen={setAccelOpen}
        onConfirm={clickStartOn}
      />
      {showIssueModal ? (
        <IssueModal
          showIssueModal={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          defaultInfo={issueDescription} // 传递默认描述
        />
      ) : null}
    </Fragment>
  );
};

export default RegionNodeSelector;
