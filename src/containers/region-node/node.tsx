import { useState, useEffect } from "react";
import { Select, Button, Table } from "antd";
import type { TableProps } from "antd";

import "./index.scss";
import loadingGif from "@/assets/images/common/jiazai.gif";
import refreshIcon from "@/assets/images/common/refresh.png";
import eventBus from "@/api/eventBus";

const { Option } = Select;

interface NodeProps {
  value: any;
  nodeTableList?: any;
  selectNode?: any;
  type?: string;
  tableLoading?: boolean;
  startAcceleration?: (node: any) => void;
  setSelectNode?: (node: any) => void;
  buildNodeList?: (node: any) => void;
  selectRegion?: any;
  setSelectRegion?: (node: any) => void;
  refreshAndShowCurrentServer: Function;
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const CustomNode: React.FC<NodeProps> = ({
  value = {},
  nodeTableList = [],
  selectNode = {},
  type,
  tableLoading,
  setSelectNode = () => {},
  startAcceleration = () => {},
  buildNodeList = () => {},
  selectRegion,
  setSelectRegion = () => {},
  refreshAndShowCurrentServer,
}) => {
  const [nodeHistory, setNodeHistory] = useState<any>([]); // 节点历史列表

  const [nodeValue, setNodeValue] = useState(""); // 节点历史value
  const [isClicking, setIsClicking] = useState(false);

  const columms: TableProps<DataType>["columns"] = [
    {
      title: "全部节点",
      dataIndex: "name",
      render: (name: any, record) => (
        <span style={record?.name === "智能节点" ? { color: "#F86C34" } : {}}>
          {name}
        </span>
      ),
    },
    {
      title: "延迟",
      dataIndex: "delay",
      align: "right",
      render: (delay: any, record) => (
        <span
          style={
            delay >= 9999
              ? { color: "#FF0000" }
              : record?.name === "智能节点"
              ? { color: "#F86C34" }
              : {}
          }
        >
          {delay >= 9999 ? "超时" : delay}
          {!(delay >= 9999) && record?.name !== "智能节点" && "ms"}
        </span>
      ),
    },
  ];

  useEffect(() => {
    const iniliteFun = async () => {
      let serverNode = value?.serverNode || {};
      const node = serverNode?.nodeHistory?.filter(
        (item: any) => item?.is_select
      )?.[0];
      const node_value: any = node?.name !== "智能节点" ? node?.key : "";

      setNodeValue(node_value || []);
      setNodeHistory(serverNode?.nodeHistory);
    };

    if (value) {
      iniliteFun();
    }
  }, [value]);

  return (
    <div className="content">
      <div className="current-settings">
        {value?.name} | {selectRegion?.qu} | {selectNode?.name || "所有服务器"}
        <div
          className={`node-select ${
            tableLoading ? "node-select-disabled" : ""
          }`}
        >
          <Select
            className="content-name"
            value={nodeValue}
            placeholder="节点记录"
            placement={"bottomRight"}
            popupMatchSelectWidth={false}
            suffixIcon={<div className={`triangle ${tableLoading ? "triangle-disabeld" : ""}`} />}
            disabled={tableLoading}
            onChange={(key) => {
              // 查询当前选中节点
              const select = nodeHistory?.filter(
                (item: any) => item?.key === key
              )?.[0];
              // 查询当前历史节点是否在当前节点列表中
              const hitIndex = nodeTableList.findIndex(
                (item: any) => select?.id === item?.id
              );

              // 如果历史节点不存在，删除此节点
              if (hitIndex === -1) {
                const nodeList = [...nodeHistory]?.filter(
                  (item: any) => item?.key !== key
                );
                const info = {
                  ...value,
                  serverNode: {
                    ...value?.serverNode,
                    nodeHistory: nodeList,
                  },
                };

                eventBus.emit("showModal", {
                  show: true,
                  type: "nodeDelete",
                });

                // 将历史节点更新缓存信息
                refreshAndShowCurrentServer(info);
                return;
              }

              setSelectNode(select);
              startAcceleration(select);
            }}
          >
            {nodeHistory?.length > 0 &&
              nodeHistory?.map(
                (item: any) =>
                  item?.name !== "智能节点" && (
                    <Option key={item?.key} value={item?.key}>
                      {item?.name}
                    </Option>
                  )
              )}
          </Select>
          <Button
            className="refresh-button"
            onClick={async () => {
              const allNodes = await buildNodeList(selectRegion);
              const node = allNodes?.[0];

              setSelectNode(node);
            }}
          >
            <img src={refreshIcon} alt="" />
            刷新
          </Button>
        </div>
      </div>
      {tableLoading ? (
        <div className="loading-spin">
          <img src={loadingGif} alt="" />
        </div>
      ) : (
        <Table
          rowKey="key"
          dataSource={nodeTableList}
          columns={columms}
          scroll={{ y: "35vh" }} // 设置表格的最大高度为240px，超过部分滚动
          pagination={false}
          rowClassName={(record: any) =>
            record?.key === selectNode?.key ? "selected-node" : ""
          }
          onRow={(record) => ({
            onClick: () => setSelectNode(record),
          })}
        />
      )}

      <Button
        type="primary"
        className="start-button"
        disabled={tableLoading}
        onClick={async () => {
          setIsClicking(true);

          if (!isClicking) {
            startAcceleration(selectNode);
          }

          setIsClicking(false);
        }}
      >
        {type === "details" ? "重新加速" : "开始加速"}
      </Button>
    </div>
  );
};

export default CustomNode;
