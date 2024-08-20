import { useState, useEffect } from "react";
import { Select, Button, Table } from "antd";
import type { TableProps } from "antd";

import "./index.scss";
import refreshIcon from "@/assets/images/common/refresh.png";

const { Option } = Select;

interface NodeProps {
  value: any;
  nodeTableList?: any;
  selectNode?: any;
  type?: string;
  startAcceleration?: (node: any) => void;
  setSelectNode?: any;
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
  setSelectNode = () => {},
  startAcceleration = () => {},
}) => {
  const [tableLoading, setTableLoading] = useState(false);

  const [selectRegion, setSelectRegion] = useState<any>(""); // 选中区服信息
  const [nodeHistory, setNodeHistory] = useState([]); // 节点历史列表

  const columms: TableProps<DataType>["columns"] = [
    {
      title: "全部节点",
      dataIndex: "name",
      render: (name: any) => name,
    },
    {
      title: "游戏延迟",
      dataIndex: "delay",
      render: (delay: any) => (
        <span style={delay === "超时" ? { color: "#FF0000" } : {}}>
          {delay}
          {!(delay === "超时") && "ms"}
        </span>
      ),
    },
  ];

  useEffect(() => {
    let serverNode = value?.serverNode || {};
    let select = (serverNode?.region || []).filter((item: any) => item?.is_select)?.[0];

    setNodeHistory(serverNode?.nodeHistory);
    setSelectRegion(select);
  }, [value]);

  return (
    <div className="content">
      <div className="current-settings">
        {value?.name} | {selectRegion?.qu} | {selectNode?.name || "所有服务器"}
      </div>
      <div className="node-select">
        <div>
          <span>节点记录:</span>
          <Select
            defaultValue={selectNode?.key}
            suffixIcon={<div className="triangle" />}
            onChange={(id) => {
              // startAcceleration(selectNode);
            }}
          >
            {nodeHistory?.length > 0 &&
              nodeHistory?.map((item: any) => {
                return (
                  <Option key={item?.key} value={item?.key}>
                    {item?.name}
                  </Option>
                );
              })}
          </Select>
        </div>
        <Button className="refresh-button">
          <img src={refreshIcon} alt="" />
          刷新
        </Button>
      </div>

      <Table
        rowKey="key"
        dataSource={nodeTableList}
        columns={columms}
        scroll={{ y: 200 }} // 设置表格的最大高度为240px，超过部分滚动
        pagination={false}
        loading={tableLoading}
        rowClassName={(record: any) =>
          record?.key === selectNode?.key ? "selected-node" : ""
        }
        onRow={(record) => ({
          onClick: () => setSelectNode(record),
        })}
      />
      <Button
        type="primary"
        className="start-button"
        disabled={tableLoading}
        onClick={() => startAcceleration(selectNode)}
      >
        {type === "details" ? "重新加速" : "开始加速"}
      </Button>
    </div>
  );
};

export default CustomNode;
