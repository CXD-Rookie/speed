import { Fragment, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "antd";
import type { TableProps } from "antd";

import "./index.scss";
import payApi from "@/api/pay";
import currencyBanner from "@/assets/images/common/currency-banner.svg";
import Active from "../active";

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
  const [currencyState, setCurrencyState] = useState(""); // 兑换错误提示
  const [currencyTable, setCurrencyTable] = useState<any>([]); // 兑换的表格数据

  const [promptOpen, setPromptOpen] = useState(false); // 是否触发领取成功提示
  const [promptInfo, setPromptInfo] = useState({}); // 领取成功优惠信息

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
    setCurrencyState("");
    setCurrencyTable([])
    setCurrencyCode("")
    setOpen(false);
  };

  // 图形码验证通过回调兑换口令
  const codeCallback = async (captcha_verify_param: any) => {
    try {
      if (captcha_verify_param?.ret !== 0) {
        return;
      }

      let res = await payApi.redeemPick({
        code: currencyCode,
        ticket: captcha_verify_param.ticket,
        randstr: captcha_verify_param.randstr,
      });

      if (res?.error === 0) {
        setCurrencyState("");
        setPromptOpen(true);
        setPromptInfo(res?.data ?? {})
      } else {
        setCurrencyState(res?.message);
      }
    } catch (error) {
      console.log("验证码错误", error);
    }
  };

  // 定义验证码js加载错误处理函数
  const loadErrorCallback = () => {
    let appid = "195964536"; // 生成容灾票据或自行做其它处理
    let ticket =
      "terror_1001_" + appid + Math.floor(new Date().getTime() / 1000);

    codeCallback({
      ret: 0,
      randstr: "@" + Math.random().toString(36).substr(2),
      ticket,
      errorCode: 1001,
      errorMessage: "jsload_error",
    });
  };

  // 唤醒图形验证码
  const handleVerifyCode = () => {
    try {
      let captcha = new (window as any).TencentCaptcha(
        "195964536",
        codeCallback,
        {
          userLanguage: "zh",
        }
      );

      captcha.show();
    } catch (error) {
      loadErrorCallback();
    }
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
    <Fragment>
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
            {currencyState && (
              <div className="exchange-error">{currencyState}</div>
            )}
            <Button
              className="currency-btn"
              type="primary"
              disabled={!currencyCode}
              onClick={handleVerifyCode}
              onMouseEnter={() => {
                if (!currencyCode) {
                  setCurrencyState("请输入兑换码后再尝试兑换");
                }
              }}
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
      <Active isVisible={promptOpen} value={promptInfo} onClose={() => setPromptOpen(false)} />
    </Fragment>
  );
};

export default CurrencyExchange;