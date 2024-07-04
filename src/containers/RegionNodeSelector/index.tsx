import React, { Fragment, useEffect, useState } from "react";
import { Modal, Tabs, Select, Button, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";
import { smart_config } from "./config";

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

  const [currentGameServer, setCurrentGameServer] = useState([]); // 当前游戏的区服
  const [regionInfo, setRegionInfo] = useState<any>({}); // 当前选择的区服信息

  const [expandedPanels, setExpandedPanels] = useState<any>({});

  const [accelOpen, setAccelOpen] = useState(false); // 加速确认
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示

  const [issueDescription, setIssueDescription] = useState<string | null>(null); // 添加状态控制 IssueModal 的默认描述

  // 刷新查询节点列表最短延迟节点
  const refreshNodesMinLatency = (all: any = regionDomList) => {
    const minDelayObject = all.reduce((min: any, current: any) => {
      return current.delay < min.delay ? current : min;
    });

    setSelectedNode(minDelayObject);
  };

  // 更新存储，展示的当前的游戏区服
  const refreshAndShowCurrentServer = (info: any) => {
    let game_list = getGameList(); // 获取应用存储的游戏列表
    let find_index = game_list.findIndex((item: any) => item?.id === info?.id);

    setRegionInfo(info?.region); // 更新当前区服信息
    setPresentGameInfo(info); // 更新当前游戏信息

    if (find_index !== -1) {
      game_list[find_index] = info;
      localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
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
  const handleSubRegions = async (gid: string, select: any = {}) => {
    try {
      let res = await playSuitApi.playSuitInfo({
        system_id: 3,
        gid,
      });
      let data = res?.data || [];

      data.unshift({
        ...smart_config,
        gid,
        system_id: 3,
      });

      if (select?.gid === gid && select?.fu) {
        let panel = data.filter(
          (item: any) => item?.qu === select?.fu && select?.gid === gid
        );

        setExpandedPanels(panel?.[0] || {});
      }

      setCurrentGameServer(data);
    } catch (error) {
      console.log(error);
    }
  };

  // 更新游戏历史选择区服
  const updateGamesRegion = (
    game_info: any = presentGameInfo,
    current_server: any = {}
  ) => {
    let region = game_info?.region || {}; // 获取当前游戏数据的区服

    // 如果当前没有游戏没有选择过区服 则进行默认选择 智能匹配
    if (Object?.keys(region)?.length < 1) {
      region = {
        select_region: smart_config, // 默认区服 智能匹配
        history_region: [smart_config], // 历史选择区服
      };
    }

    // 点击新区服进行添加到历史记录
    if (Object?.keys(current_server)?.length > 0) {
      let history = region?.history_region; // 区服的历史记录
      let find_sort = history.findIndex(
        (item: any) => item?.qu === current_server?.qu
      ); // 判断是否重复数据

      region = {
        select_region: current_server, // 点击选择的区服
        history_region:
          find_sort !== -1 ? history : [...history, current_server], // 历史选择区服
      };
    }

    // 更新存储应用数据
    refreshAndShowCurrentServer({
      ...game_info,
      region,
    });

    return region;
  };

  // 初始化获取所有的加速服务器列表
  const fetchAllSpeedList = async (params = {}) => {
    try {
      let res = await playSuitApi.playSpeedList({
        platform: 3,
        ...params,
      });
      let nodes = res?.data || [];

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

      return updatedNodes;
    } catch (error) {
      console.log("初始化获取所有的加速服务器列表:", error);
    }
  };

  // 切换 tabs 进行区服 节点切换
  const tabsChange = async (event: any) => {
    if (event === "2") {
      let all = await fetchAllSpeedList(); // 暂时只有固定的几个节点，所以直接获取节点就行，不需要传区服id
      let dom_info = presentGameInfo?.dom_info || {};
      console.log(all);

      if (all) {
        if (Object.keys(dom_info)?.length > 0) {
          setDomHistory(dom_info);
        } else {
          refreshNodesMinLatency(all);
        }
      }
    }

    setActiveTab(event);
  };

  // 点击 选择区服
  const clickRegion = (option: any) => {
    tabsChange("2");
    updateGamesRegion(presentGameInfo, option);
  };

  // 选择的服
  const togglePanel = (option: any) => {
    // 如果当前游戏服具有不同的区，进行更新节点操作
    let default_option = { ...option };

    if (option?.fu) {
      default_option = currentGameServer.filter(
        (item: any) => item?.qu === option?.fu
      )?.[0];
    }

    if (default_option?.children) {
      setExpandedPanels(default_option);
    }

    clickRegion(option);
  };

  useEffect(() => {
    const initializeFetch = async () => {
      let region = updateGamesRegion(options); // 检测是否有选择过的区服, 有就取值，没有就进行默认选择
      let select = region?.select_region;

      setPresentGameInfo(options); // 更新当前游戏信息
      handleSubRegions(options?.id, select?.fu && select); // 改为调用 handleSubRegions 初始化获取所有的区服信息
    };

    if (open) {
      initializeFetch();
    }
  }, [open]);

  return (
    <Fragment>
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
        <Tabs activeKey={activeTab} onChange={tabsChange}>
          <TabPane tab="区服" key="1">
            <div className="content">
              <div className="current-box">
                <div className="current-game">{options?.name}</div>
                <div className="current-region">
                  当前区服:
                  <Select
                    className="region-select"
                    value={regionInfo?.select_region?.qu}
                    onChange={(value) =>
                      togglePanel(
                        regionInfo?.history_region?.filter(
                          (child: any) => child?.qu === value
                        )?.[0]
                      )
                    }
                  >
                    {regionInfo?.history_region?.map((item: any) => {
                      return (
                        <Option key={item?.qu} value={item?.qu}>
                          {item?.fu && item?.fu + "-"}
                          {item?.qu}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
              <div className="region-buttons">
                {currentGameServer?.length > 0 &&
                  currentGameServer?.map((item: any) => {
                    let current = regionInfo?.select_region;

                    return (
                      <Button
                        key={item.qu}
                        onClick={() => togglePanel(item)}
                        className={`${
                          (current?.qu === item?.qu ||
                            item?.children?.some(
                              (child: any) => child?.fu === current?.fu
                            )) &&
                          "select-button"
                        } region-button public-button`}
                      >
                        {item.qu}
                        {item.children && (
                          <span
                            className={
                              expandedPanels?.qu === item?.qu
                                ? "up-triangle"
                                : "down-triangle"
                            }
                          />
                        )}
                      </Button>
                    );
                  })}
              </div>
              <div className="sub-btns">
                {expandedPanels?.children &&
                  expandedPanels?.children?.map((item: any) => {
                    let current = regionInfo?.select_region;

                    return (
                      <Button
                        key={item.qu}
                        className={`${
                          current?.qu === item?.qu && "select-button"
                        } region-button`}
                        onClick={() => clickRegion(item)}
                      >
                        {item.qu}
                      </Button>
                    );
                  })}
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
                <Button
                  className="refresh-button"
                  onClick={() => refreshNodesMinLatency()}
                >
                  刷新
                </Button>
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
                {type === "details" ? "重新加速" : "开始加速"}
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
      {accelOpen ? (
        <BreakConfirmModal
          accelOpen={accelOpen}
          type={"switchServer"}
          setAccelOpen={setAccelOpen}
          onConfirm={clickStartOn}
        />
      ) : null}
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
