import { useState, useEffect, Fragment, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Tabs, Spin } from "antd";
import type { TabsProps } from "antd";
import { useGamesInitialize } from "@/hooks/useGamesInitialize";
import { useHistoryContext } from "@/hooks/usePreviousRoute";

import "./index.scss";
import playSuitApi from "@/api/speed";
import tracking from "@/common/tracking";
import CustomRegion from "./region";
import CustomNode from "./node";
import BreakConfirmModal from "../break-confirm";
import loadingGif from "@/assets/images/common/jiazai.gif";

interface RegionNodeSelectorProps {
  open: boolean;
  type?: string;
  options: any;
  ref?: any;
  stopSpeed?: () => void;
  onCancel: () => void;
  notice?: (value: any) => void;
}

const iniliteSmart = {
  fu: "",
  qu: "智能匹配",
  suit: "智能匹配", // 智能匹配在此游戏是国服游戏时传值国服，其他查询全部
  is_select: false, // 是否选择当前区服
};

const CustomRegionNode: React.FC<RegionNodeSelectorProps> = forwardRef(
  (props, ref) => {
    const {
      options = {},
      open,
      type = "details",
      onCancel,
      notice = () => {},
    } = props;
    const {
      getGameList,
      identifyAccelerationData,
      removeGameList,
      checkShelves,
    } = useGamesInitialize();

    const historyContext: any = useHistoryContext();

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("region"); // tab栏值
    const [loading, setLoading] = useState(false); // 初始化loading
    const [tableLoading, setTableLoading] = useState(false); // 刷新节点loading
    const [accelOpen, setAccelOpen] = useState(false); // 加速确认
    const [accelOpenType, setAccelOpenType] = useState("accelerate"); // 详情加速游戏类型

    const [presentGameData, setPresentGameInfo] = useState<any>({}); // 当前期望加速的游戏信息
    const [currentGameServer, setCurrentGameServer] = useState([]); // 当前游戏的区服列表

    const [selectRegion, setSelectRegion] = useState<any>({}); // 当前选中的区服

    const [nodeTableList, setNodeTableList] = useState([]); // 节点表格数据
    const [selectNode, setSelectNode] = useState<any>({}); // 选中节点

    const [isClicking, setIsClicking] = useState(false); // 如果点击了加速立即禁用第二次点击，避免多次点击

    const generateNode = async (data = presentGameData) => {
      const result = { ...data };
      
      let allNodes = await buildNodeList(selectRegion);
      
      const node = updateSelectNode(presentGameData, allNodes);

      if (node?.is_select && node?.name !== "智能节点") {
        const find = allNodes.findIndex((item: any) => item?.key === node?.key);
        const elementToMove = allNodes[find];

        allNodes.splice(find, 1);
        allNodes.splice(1, 0, elementToMove);

        setNodeTableList(allNodes);
      }

      return result;
    };

    // 更新历史节点
    const updateGamesDom = (node: any, option: any = presentGameData) => {
      let gameData = { ...option };
      let nodeHistory = gameData?.serverNode?.nodeHistory || [];

      let find_index = nodeHistory.findIndex(
        (item: any) =>
          item?.key === node?.key ||
          (item?.name === "智能节点" && node?.name === "智能节点")
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
        is_select: false,
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
          if ((window as any).stopDelayTimer) {
            (window as any).stopDelayTimer();
          }

          tracking.trackBoostDisconnectManual("手动停止加速");
          historyContext?.accelerateTime?.stopTimer();
          removeGameList("initialize"); // 更新我的游戏

          const game = {
            ...presentGameData,
            serverNode: {
              ...presentGameData?.serverNode,
              selectRegion,
            },
          }; // 当前游戏信息
          let serverNode = { ...game?.serverNode }; // 区服节点存储数据
          let isNode = true;
          let isAuto = false;

          // 如果有选中节点
          if (Object.keys(node)?.length > 0) {
            serverNode = {
              ...serverNode,
              nodeHistory: updateGamesDom(node, game),
            };

            isNode = false;
            isAuto = true;
          }

          // 手动传值游戏信息
          const state_data = {
            ...game,
            serverNode,
            isNode,
            isAuto,
            router: "details",
          };

          // 如果是在卡片进行加速的过程中将选择的信息回调到卡片
          if (type === "acelerate") {
            notice(state_data);
            navigate("/home");
          } else {
            // 跳转到首页并触发自动加速autoAccelerate
            navigate("/home", {
              state: {
                isNav: true,
                data: state_data,
                autoAccelerate: true,
              },
            });
          }

          onCancel();
        }
      );
    };

    // 开始加速
    const startAcceleration = async (node: any = selectNode) => {
      const isFind = identifyAccelerationData()?.[0] || false; // 当前是否有加速数据
      const isShelves = await checkShelves(
        { ...presentGameData},
        {
          onOk: onCancel,
          onTrigger: onCancel,
        }
      );
      
      if (isShelves) {
        return; // 判断是否当前游戏下架
      }
        
      if (isFind) {
        // 在游戏详情中进行区服节点切换进行提示窗类型
        if (window.location.hash === "#/gameDetail") {
          setAccelOpenType("switchServer");
        }

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
    const fetchAllSpeedList = async (keys: any = []) => {
      try {
        let res = await playSuitApi.playSpeedList({
          platform: 3,
        });
        const nodes = (res?.data || []).filter((value: any) =>
          (value?.playsuits || []).some((item: any) =>
            keys.includes(String(item))
          )
        );

        const updatedNodes = await Promise.all(
          nodes.map(async (node: any) => {
            try {
              const jsonString = JSON.stringify({
                params: { addr: node?.addr, server: node?.server },
              });

              // 如果 NativeApi_AsynchronousRequest 没有错误回调，也可以添加一个超时机制
              return new Promise<any>((resolve) => {
                (window as any).NativeApi_AsynchronousRequest(
                  "NativeApi_GetAddrDelay",
                  jsonString,
                  function (response: any) {
                    console.log("Success response from 获取延迟:", response);
                    const jsonResponse = JSON.parse(response);
                    const delay = jsonResponse?.delay;

                    resolve({
                      ...node,
                      delay,
                    });
                  }
                );
              });
            } catch (error) {
              console.error("Error processing node:", node, error);
              return {
                ...node,
                delay: 9999,
              };
            }
          })
        );

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

    // 游戏区服列表 qu 选中区服的 suit current 游戏的区服列表
    const fetchPlaysuit = async (qu = "", current: any = currentGameServer) => {
      try {
        const res = await playSuitApi.playSuitList();
        const data = res?.data || {};
        const keys = Object.keys(data).filter(
          (key) =>
            qu === "全部" // 当前游戏所有区服的节点
              ? current.some((child: any) => child?.qu === data?.[key])
              : data?.[key] === qu // 选中区服下的节点
        );

        return keys || [];
      } catch (error) {
        console.log("error", error);
      }
    };

    // 生成所有的加速节点服务器列表
    const buildNodeList = async (option: any = {}, event: any = {}) => {
      setTableLoading(true); // 节点表格loading

      let data = currentGameServer; // 当前区服列表

      // 当前游戏区服的数量为0
      if (!(currentGameServer?.length > 0)) {
        data = await handleSubRegions(event); // 当前区服列表
      }

      let suit = await fetchPlaysuit(option?.suit, data);
      let all: any = (await fetchAllSpeedList(suit)) || []; // 获取节点列表
      
      all.unshift({
        ...all?.[0],
        name: "智能节点",
      });

      all = all.map((item: any, index: number) => {
        const delay = item.delay;

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
        const hitNode = allNodes.filter(
          (item: any) => item?.key === result?.key
        )?.[0];

        if (!hitNode) {
          result = hitNode || allNodes?.[0];
        }
      } else {
        result = allNodes?.[0];
      }

      setSelectNode(result);
      return result;
    };

    // 选中当前区服，判断区服的suit值应该存什么，用于查询那些节点
    const generateRSuit = (
      data: any = {}, // data 当前游戏信息
      current: any = null, // current 当前点击选中的区服
      regionList = [] // regionList 当前游戏有多少区服
    ) => {
      let region = data?.serverNode?.selectRegion; // 历史存储区服
      
      let suit =
        data?.playsuit === 2 // 当前游戏是否是国服游戏
          ? "国服"
          : regionList?.length > 1
          ? "全部" // "智能匹配"
          : "国际服"; // 智能匹配在此游戏是国服游戏时传值国服，其他查询全部

      // 如果传入了点击选中区服
      if (current?.qu) {
        region = {
          ...current,
          suit:
            data?.playsuit === 2 // 当前游戏是否是国服游戏
              ? "国服"
              : regionList?.length <= 1 
                ? "国际服" 
                : current?.qu === "智能匹配" 
                ? "全部" 
                : current?.qu,
        };
      } else {
        // 如果没有存储历史区服
        if (!region) {
          region = { ...iniliteSmart, suit }; // 默认智能匹配
        }
      }
      
      setSelectRegion(region);
    };

    // 获取每个区服的子区服列表
    const handleSubRegions = async (event: any = options) => {
      try {
        setLoading(true);

        let res = await playSuitApi.playSuitInfo({
          system_id: 3,
          gid: event?.id,
        });
        let data = res?.data || [];

        data.unshift({
          fu: "",
          qu: "智能匹配",
          gid: event?.id,
          system_id: 3,
        });

        setCurrentGameServer(data);
        return data;
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const items: TabsProps["items"] = [
      {
        key: "region",
        label: "区服",
        children: loading ? (
          <div className="loading-spin">
            <img src={loadingGif} alt="" />
          </div>
        ) : (
          <CustomRegion
            value={presentGameData}
            type={type}
            selectRegion={selectRegion}
            setSelectRegion={setSelectRegion}
            currentGameServer={currentGameServer}
            startAcceleration={startAcceleration}
            selectNode={selectNode}
            setSelectNode={setSelectNode}
            generateRSuit={generateRSuit}
          />
        ),
      },
      {
        key: "node",
        label: "节点",
        disabled: loading,
        children: (
          <CustomNode
            value={presentGameData}
            type={type}
            selectRegion={selectRegion}
            setSelectRegion={setSelectRegion}
            nodeTableList={nodeTableList}
            selectNode={selectNode}
            tableLoading={tableLoading}
            setSelectNode={setSelectNode}
            startAcceleration={startAcceleration}
            buildNodeList={buildNodeList}
            refreshAndShowCurrentServer={refreshAndShowCurrentServer}
          />
        ),
      },
    ];

    useImperativeHandle(ref, () => ({
      getFastestNode: async (value: any, option: any) => {
        let nodes: any = [];

        if (option?.isNode || (!option?.isNode && !option?.isAuto)) {
          const allNodes = await buildNodeList(value, option);
          const node = allNodes?.[0];

          nodes = await updateGamesDom(node, option);
          option.serverNode.nodeHistory = nodes;
        }

        return option;
      },
    }));

    useEffect(() => {
      const iniliteFun = async () => {
        setActiveTab("region"); // 初始化设置tabs为区服
        const list = await handleSubRegions(); // 获取区服列表接口

        setPresentGameInfo(options); // 更新当前游戏信息
        generateRSuit(options, {}, list); // 存储当前选中区服
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
            onChange={(key: string) => {
              setActiveTab(key);

              if (key === "node") {
                generateNode();
              }
            }}
          />
        </Modal>
        {accelOpen ? (
          <BreakConfirmModal
            accelOpen={accelOpen}
            type={accelOpenType}
            setAccelOpen={setAccelOpen}
            onConfirm={async () => {
              setAccelOpen(false);
              setIsClicking(true);

              if (!isClicking) {
                await clickStartOn(selectNode);
              }

              setIsClicking(false);
            }}
          />
        ) : null}
      </Fragment>
    );
  }
);

export default CustomRegionNode;