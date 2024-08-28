import { useState, useEffect, Fragment, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";

import "./index.scss";
import playSuitApi from "@/api/speed";
import tracking from "@/common/tracking";
import CustomRegion from "./region";
import CustomNode from "./node";
import BreakConfirmModal from "../break-confirm";

interface RegionNodeSelectorProps {
  open: boolean;
  type?: string;
  options: any;
  ref?: any;
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

const CustomRegionNode: React.FC<RegionNodeSelectorProps> = forwardRef(
  (props, ref) => {
    const { options, open, type = "details", onCancel, notice = () => {} } = props;
    const { getGameList, identifyAccelerationData, removeGameList } =
      useGamesInitialize();
    const historyContext: any = useHistoryContext();

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("region"); // tab栏值
    const [loading, setLoading] = useState(false); // 初始化loading
    const [tableLoading, setTableLoading] = useState(false); // 刷新节点loading
    const [accelOpen, setAccelOpen] = useState(false); // 加速确认

    const [presentGameData, setPresentGameInfo] = useState<any>({}); // 当前期望加速的游戏信息
    const [currentGameServer, setCurrentGameServer] = useState([]); // 当前游戏的区服

    const [nodeTableList, setNodeTableList] = useState([]); // 节点表格数据
    const [selectNode, setSelectNode] = useState({}); // 选中节点

    // 更新历史节点
    const updateGamesDom = (node: any) => {
      let gameData = { ...presentGameData };
      let nodeHistory = gameData?.serverNode?.nodeHistory || [];

      let find_index = nodeHistory.findIndex(
        (item: any) => item?.key === node?.key
      );

      // 删除重复数据
      if (find_index !== -1) {
        nodeHistory.splice(find_index, 1);
      }

      // 删除超出10个以后数据
      if (nodeHistory?.length >= 10) {
        nodeHistory.splice(9);
      }

      // 非本条数据全部置为未选中
      nodeHistory = nodeHistory.map((item: any) => ({
        ...item,
        is_select: item?.is_select,
      }));
      nodeHistory.unshift({
        ...node,
        is_select: true,
      });
      gameData.serverNode.nodeHistory = nodeHistory;

      refreshAndShowCurrentServer(gameData);
      return nodeHistory;
    };

    // 实际调用加速逻辑
    const clickStartOn = (node: any) => {
      const userToken = localStorage.getItem("token");
      const jsKey = localStorage.getItem("StartKey");

      let jsonString = "";

      if (jsKey) {
        jsonString = JSON.stringify({
          params: {
            user_token: userToken ? JSON.parse(userToken) : "",
            js_key: jsKey,
          },
        });
      }
      (window as any).NativeApi_AsynchronousRequest(
        "NativeApi_StopProxy",
        jsonString,
        function (response: any) {
          console.log("Success response from 停止加速:", response);
          tracking.trackBoostDisconnectManual("手动停止加速");
          historyContext?.accelerateTime?.stopTimer();

          const nodeHistory = updateGamesDom(node);

          if ((window as any).stopDelayTimer) {
            (window as any).stopDelayTimer();
          }

          removeGameList("initialize"); // 更新我的游戏

          // 如果是在卡片进行加速的过程中将选择的信息回调到卡片
          if (type === "acelerate") {
            notice({
              ...presentGameData,
              serverNode: {
                ...presentGameData?.serverNode,
                nodeHistory,
              },
              is_manual: true,
            });

            navigate("/home");
          } else {
            // 跳转到首页并触发自动加速autoAccelerate
            navigate("/home", {
              state: {
                isNav: true,
                data: {
                  ...presentGameData,
                  serverNode: {
                    ...presentGameData?.serverNode,
                    nodeHistory,
                  },
                  router: "details",
                },
                autoAccelerate: true,
                is_manual: true,
              },
            });
          }

          onCancel();
        }
      );
    };

    // 开始加速
    const startAcceleration = async (node: any = selectNode) => {
      let isFind = identifyAccelerationData()?.[0] || {}; // 当前是否有加速数据

      if (isFind && type === "details") {
        setAccelOpen(true);
      } else {
        clickStartOn(node);
      }
    };

    // 更新存储，展示的当前的游戏区服
    const refreshAndShowCurrentServer = (info: any) => {
      let game_list = getGameList(); // 获取应用存储的游戏列表
      let find_index = game_list.findIndex(
        (item: any) => item?.id === info?.id
      );

      setPresentGameInfo(info); // 更新当前游戏信息

      if (find_index !== -1) {
        game_list[find_index] = info;
        localStorage.setItem("speed-1.0.0.1-games", JSON.stringify(game_list));
      }
    };

    // 初始化获取所有的加速服务器列表
    const fetchAllSpeedList = async (key = -1) => {
      try {
        let res = await playSuitApi.playSpeedList({
          platform: 3,
        });
        const nodes =
          key === -1
            ? res?.data || []
            : (res?.data || []).filter((value: any) =>
                (value?.playsuits || []).includes(Number(key))
              );
        const updatedNodes: any[] = [];

        for (const node of nodes) {
          try {
            const updatedNode = await new Promise<any>((resolve, reject) => {
              const jsonString = JSON.stringify({
                // params: { ip: node?.addr },
                params: { addr: node?.addr, server: node?.server },
              });

              // 如果 NativeApi_AsynchronousRequest 没有错误回调，也可以添加一个超时机制
              const timeoutId = setTimeout(() => {
                resolve({
                  ...node,
                  delay: "超时",
                });
              }, 5000); // 5秒超时，可以根据需要调整

              (window as any).NativeApi_AsynchronousRequest(
                "NativeApi_GetAddrDelay",
                jsonString,
                function (response: any) {
                  console.log("Success response from 获取延迟:", response);
                  const jsonResponse = JSON.parse(response);
                  // const delay = jsonResponse?.delay + node?.proxy_delay;
                  const delay = jsonResponse?.delay;

                  clearTimeout(timeoutId); // 请求成功时清除超时定时器
                  resolve({
                    ...node,
                    delay: delay >= 9999 ? "超时" : delay,
                  });
                }
              );
            });

            updatedNodes.push(updatedNode);
          } catch (error) {
            console.error("Error processing node:", node, error);
            updatedNodes.push({
              ...node,
              delay: "超时",
            });
          }
        }

        const sortedData = updatedNodes.sort((a, b) => {
          if (a.health !== b.health) {
            return a.health - b.health; // 首先比较 health 字段
          } else {
            return a.delay - b.delay; // 如果 health 相同，再比较 delay 字段
          }
        });
        return sortedData;
      } catch (error) {
        console.log("初始化获取所有的加速服务器列表:", error);
      }
    };

    // 游戏区服列表
    const fetchPlaysuit = async (qu = "") => {
      try {
        const res = await playSuitApi.playSuitList();
        const key = Object.entries(res?.data || {}).find(
          ([key, value]) => value === qu
        )?.[0];

        return key || -1;
      } catch (error) {
        console.log("error", error);
      }
    };

    // 生成所有的加速节点服务器列表
    const buildNodeList = async (option: any = {}) => {
      setTableLoading(true);

      let suit = await fetchPlaysuit(option?.suit);
      let all: any = (await fetchAllSpeedList(Number(suit))) || []; // 获取节点列表

      all.unshift({
        ...all?.[0],
        name: "智能节点",
      });

      all = all.map((item: any, index: number) => {
        const operations = [-3, 3];
        // 从数组中随机选择一个操作
        const randomOffset =
          operations[Math.floor(Math.random() * operations.length)];
        const delay = item.delay + randomOffset;
        
        return {
          ...item,
          key: item?.name === "智能节点" ? index + item?.id : item?.id,
          delay: item?.name === "智能节点" ? "当前最优" : delay < 1 ? 1 : delay,
        };
      });
      
      setNodeTableList(all);
      setTableLoading(false);
      return all;
    };

    // 更新当前选中节点服务器
    const updateSelectNode = (data: any, allNodes = nodeTableList) => {
      let result: any = {};

      const nodes = data?.serverNode?.nodeHistory;
      if (nodes) {
        result = nodes.filter((item: any) => item?.is_select)?.[0];
        const hitNode = allNodes.filter((item: any) => item?.key === result?.key)?.[0]
        
        if (!hitNode) {
          result = hitNode || allNodes?.[0]
        }
      } else {
        result = allNodes?.[0];
      }
      
      setSelectNode(result);
      return result;
    };

    // 更新游戏历史选择区服
    const updateGamesRegion = async (
      info: any = {},
      event: RegionProps = {}
    ) => {
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
            },
          ],
        };
      }

      // 点击新区服进行添加到历史记录
      if (Object?.keys(event)?.length > 0) {
        let find_index = serverNode?.region?.findIndex(
          (item: any) => item?.qu === event?.qu
        );

        // 删除重复数据
        if (find_index !== -1) {
          result.serverNode.region.splice(find_index, 1);
        }

        // 删除超出10个以后数据
        if (serverNode.region?.length >= 10) {
          result.serverNode.region.splice(9);
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

      // 当前选中的区服
      const select = result.serverNode.region?.filter(
        (item: any) => item?.is_select
      )?.[0];
      
      const allNodes = await buildNodeList(select);

      updateSelectNode(result, allNodes);
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

        setCurrentGameServer(data);
        return data;
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
            value={presentGameData}
            loading={loading}
            type={type}
            currentGameServer={currentGameServer}
            updateGamesRegion={updateGamesRegion}
            startAcceleration={startAcceleration}
          />
        ),
      },
      {
        key: "node",
        label: "节点",
        children: (
          <CustomNode
            value={presentGameData}
            nodeTableList={nodeTableList}
            selectNode={selectNode}
            tableLoading={tableLoading}
            setSelectNode={setSelectNode}
            startAcceleration={startAcceleration}
            buildNodeList={buildNodeList}
          />
        ),
      },
    ];

    useImperativeHandle(ref, () => ({
      getFastestNode: async (value: any, option: any) => {
        let allNodes = await buildNodeList(value);
        let nodes = option?.serverNode?.nodeHistory || [];

        nodes = nodes.map((item: any) => {
          if (item?.key === allNodes?.[0]?.key) {
            return {
              ...allNodes?.[0],
              is_select: true
            };
          }

          return { ...item, is_select: false };
        })

        option.serverNode.nodeHistory = nodes;
        
        return option;
      },
    }));

    useEffect(() => {
      const iniliteFun = async () => {
        setLoading(true);

        await Promise.all([
          handleSubRegions(),
          updateGamesRegion(options), // 检测是否有选择过的区服, 有就取值，没有就进行默认选择
        ]);
        setActiveTab("region");
        setLoading(false);
      };

      if (open) {
        iniliteFun();
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
          <Tabs
            activeKey={activeTab}
            items={items}
            onChange={(key: string) => setActiveTab(key)}
          />
        </Modal>
        {accelOpen ? (
          <BreakConfirmModal
            accelOpen={accelOpen}
            type={"switchServer"}
            setAccelOpen={setAccelOpen}
            onConfirm={() => clickStartOn(selectNode)}
          />
        ) : null}
      </Fragment>
    );
  }
);

export default CustomRegionNode;