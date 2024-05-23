import React, { useState } from 'react';
import { Modal, Tabs, Select, Button, Table } from 'antd';
import './index.scss';
import playSuitApi from "@/api/speed";
const { TabPane } = Tabs;
const { Option } = Select;
const { Column } = Table;

interface RegionNodeSelectorProps {
  visible: boolean;
  onCancel: () => void;
}

const RegionNodeSelector: React.FC<RegionNodeSelectorProps> = ({ visible, onCancel }) => {
  const [selectedRegion, setSelectedRegion] = useState('亚服-所有服务器');
  const [selectedMode, setSelectedMode] = useState('路由模式');
  const [selectedNode, setSelectedNode] = useState('0418 亚洲网20');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);

  const regions = ['亚服', '韩服', '东南亚服', '美服', '日服', '澳服', '欧服', '俄服'];
  const nodes = [
    { key: '1', name: '北京-A1234', delay: '56ms', packetLoss: '60%', mode: '进程模式' },
    { key: '2', name: '北京-A1234', delay: '98ms', packetLoss: '80%', mode: '路由模式' },
    { key: '3', name: '北京-A1234', delay: '98ms', packetLoss: '80%', mode: '进程模式' },
    { key: '4', name: '北京-A1234', delay: '98ms', packetLoss: '80%', mode: '路由模式' },
    { key: '5', name: '北京-A1234', delay: '98ms', packetLoss: '80%', mode: '进程模式' },
  ];

  const handleNodeClick = (node: typeof nodes[0]) => {
    setSelectedNodeKey(node.key);
    console.log('Selected node:', node);
  };

  return (
    <Modal
      title="区服、节点选择"
      visible={visible}
      onCancel={onCancel}
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
                <Option value="亚服-所有服务器">亚服-所有服务器</Option>
                {regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="region-buttons">
              {regions.map((region) => (
                <Button key={region} className="region-button">
                  {region}
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
              <Select defaultValue={selectedMode} onChange={(value) => setSelectedMode(value)}>
                <Option value="路由模式">路由模式</Option>
                <Option value="进程模式">进程模式</Option>
              </Select>
            </div>
            <div className="node-select">
              节点记录:
              <Select defaultValue={selectedNode} onChange={(value) => setSelectedNode(value)}>
                <Option value="0418 亚洲网20">0418 亚洲网20</Option>
              </Select>
              <Button className="refresh-button">刷新</Button>
            </div>
            <Table
              dataSource={nodes}
              pagination={false}
              rowClassName={(record) => (record.key === selectedNodeKey ? 'selected-node' : '')}
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
