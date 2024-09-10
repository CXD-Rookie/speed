import { useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "antd";
import type { TableProps } from "antd";

import "./index.scss";
import currencyBanner from "@/assets/images/common/currency-banner.svg";

interface CurrencyProps {
  open: boolean;
  setOpen: (event: boolean) => void;
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const CurrencyExchange: React.FC<CurrencyProps> = (props) => {
  const { open, setOpen } = props;

  const [currencyCode, setCurrencyCode] = useState(""); // 输入的兑换码
  const [currencyTable, setCurrencyTable] = useState<any>([]); // 兑换的表格数据

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "兑换内容",
      dataIndex: "a",
      render: (text) => <span className="a-columns-render">{text}</span>,
    },
    {
      title: "兑换码",
      dataIndex: "b",
      render: (text) => <span className="a-columns-render">{text}</span>,
    },
    {
      title: "有效期",
      dataIndex: "c",
      render: (text) => <span className="c-columns-render">{text}</span>,
    },
    {
      title: "状态",
      align: "right",
      dataIndex: "state",
      render: (text) => <span className="a-columns-render">{text}</span>,
    },
  ];

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setCurrencyTable([
      {
        a: "75折卡",
        b: "vipAAA",
        c: "3天后过期",
        state: 1,
      },
      {
        a: "75折卡",
        b: "vipAAA",
        c: "3天后过期",
        state: 1,
      },
    ]);
  }, []);

  return (
    <Modal
      className="currency-exchange"
      open={open}
      onCancel={onClose}
      title="我的优惠券"
      width={"67.6vw"}
      centered
      maskClosable={false}
      footer={null}
    >
      <img className="currency-banner" src={currencyBanner} alt="" />
      <div className="currency-content">
        <div className="currency-title">口令兑换</div>
        <Input
          className="currency-input"
          placeholder="请输入口令/兑换码"
          onChange={(event) => setCurrencyCode(event?.target.value)}
        />
        <div className="currency-btn-box">
          <Button
            className="currency-btn"
            type="primary"
            disabled={!currencyCode}
          >
            立即兑换
          </Button>
        </div>
        <Table
          className="table"
          dataSource={currencyTable}
          columns={columns}
          rowKey={"rid"}
          pagination={false}
          scroll={{
            y: ``,
          }}
        />
      </div>
    </Modal>
  );
};

export default CurrencyExchange;