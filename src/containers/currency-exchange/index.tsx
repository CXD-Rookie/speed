// 口令兑换
import { Fragment, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "antd";
import type { TableProps } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrencyOpen,
  setDrawVipActive,
  setPayState,
} from "@/redux/actions/modal-open";
import { nodeDebounce, validateRequiredParams } from "@/common/utils";
import { validityPeriod } from "./utils";

import "./index.scss";
import tracking from "@/common/tracking";
import payApi from "@/api/pay";
import currencyBanner from "@/assets/images/common/currency-banner.png";
import noDataIcon from "@/assets/images/common/no-data.svg";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const inilitePagination = { page: 1, pagesize: 20 };
const iniliteStatusObj: any = {
  1: "立即使用>",
  2: "已使用",
  3: "已过期",
}

const CurrencyExchange: React.FC = (props) => {
  const dispatch: any = useDispatch();

  const open = useSelector((state: any) => state?.modalOpen?.currencyOpen);
  
  const [currencyCode, setCurrencyCode] = useState(""); // 输入的兑换码
  const [currencyState, setCurrencyState] = useState(""); // 兑换错误提示
  const [currencyTable, setCurrencyTable] = useState<any>([]); // 兑换的表格数据

  const [pagination, setPagination] = useState(inilitePagination); // 兑换记录分页
  const [tableTotal, setTableTotal] = useState(0);

  const [isHoverStatus, setIsHoverStatus] = useState("");

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "兑换内容",
      dataIndex: "redeem_code",
      width: 100,
      ellipsis: true,
      render: (redeem_code) => (
        <span className="code-columns-render">{redeem_code?.name}</span>
      ),
    },
    {
      title: "兑换码",
      width: 70,
      ellipsis: true,
      dataIndex: "redeem_code",
      render: (redeem_code) => (
        <span className="code-columns-render">{redeem_code?.redeem_code}</span>
      ),
    },
    {
      title: "有效期",
      width: 100,
      ellipsis: true,
      render: (record) => (
        <span
          className="record-columns-render"
          style={
            validityPeriod(record).indexOf("过期") === -1
              ? { color: "#999" }
              : { color: "#EF622A" }
          }
        >
          {validityPeriod(record)}
        </span>
      ),
    },
    {
      title: "状态",
      width: 70,
      ellipsis: true,
      align: "right",
      render: (record) => (
        <span
          className="record-columns-render"
          style={
            record?.status === 1
              ? {
                  color: isHoverStatus === record?.id ? "#EF622A" : "#666",
                  cursor: "pointer",
                }
              : {}
          }
          onMouseOver={() => setIsHoverStatus(record?.id)}
          onMouseLeave={() => setIsHoverStatus("")}
          onClick={() => {
            if (record?.status === 1) {
              tracking.trackPurchasePageShow("redemption");
              dispatch(setPayState({ open: true, couponValue: record ?? {} })); // 会员充值页面
              dispatch(setCurrencyOpen(false));
            }
          }}
        >
          {iniliteStatusObj?.[record?.status]}
        </span>
      ),
    },
  ];

  const onClose = () => {
    setCurrencyCode("");
    setCurrencyState("");
    setCurrencyTable([]);
    dispatch(setPayState({ open: false, couponValue: {} })); // 会员充值页面
    dispatch(setCurrencyOpen(false));
    dispatch(setDrawVipActive({ open: false, value: {} }));
    setPagination(inilitePagination);
    setTableTotal(0);
  };

  // 图形码验证通过回调兑换口令
  const codeCallback = async (captcha_verify_param: any) => {
    try {
      if (captcha_verify_param?.ret !== 0) {
        return;
      }

      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }

      let res = await payApi.redeemPick({
        code: currencyCode,
        ticket: captcha_verify_param.ticket,
        randstr: captcha_verify_param.randstr,
      });

      if (res?.error === 0) {
        const data = res?.data;
        const category = data?.type === 1 ? "member" : "discount";
        const content = data?.content;
        const channel = data?.channel;

        tracking.trackRedemption(
          `category=${category};code=${currencyCode};content=${content};channel=${channel}`
        );
        setCurrencyState("");
        dispatch(setDrawVipActive({ open: true, value: res?.data ?? {} })); // 领取兑换码弹窗
        fetchRecords();
        setCurrencyCode("");
        setCurrencyState("");
        dispatch(setPayState({ open: false, couponValue: {} })); // 会员充值页面
      } else {
        setCurrencyState(res?.message);
      }
    } catch (error) {
      console.log("验证码错误", error);
    }
  };

  // 定义验证码js加载错误处理函数
  const loadErrorCallback = () => {
    let appid = process.env.REACT_APP_CAPTCHA_APPID_CURRENCY; // 生成容灾票据或自行做其它处理
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
        process.env.REACT_APP_CAPTCHA_APPID_CURRENCY,
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

  // 获取兑换记录
  const fetchRecords = async (
    default_pagination: any = pagination,
    search: any = {
      sort: "create_time:-1",
    }
  ) => {
    try {
      const reqire = await validateRequiredParams();

      if (!reqire) {
        return;
      }
      
      const res = await payApi.redeemList({
        ...default_pagination,
        ...search,
      });
      const data = res?.data?.list || [];
      
      setTableTotal(res?.data?.total || 0);
      setCurrencyTable(
        default_pagination?.page > 1 ? [...currencyTable, ...data] : data
      );
    } catch (error) {
      console.log(error);
    }
  };

  // 表格滚动
  function handleScroll(e: any) {
    if (e.target.getAttribute("class") === "ant-table-body") {
      let scrollTop = e.target.scrollTop;
      let clientHeight = e.target.clientHeight;
      let scrollHeight = e.target.scrollHeight;

      if (
        Math.ceil(scrollTop) + Math.ceil(clientHeight) + 1 >= scrollHeight &&
        tableTotal > currencyTable?.length
      ) {
        setPagination({ ...pagination, page: pagination?.page + 1 });
      }
    }
  }

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open, pagination]);

  return (
    <Fragment>
      <Modal
        className="currency-exchange"
        open={open}
        onCancel={onClose}
        title="我的优惠券"
        width={"45vw"}
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
            value={currencyCode}
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
            >
              立即兑换
            </Button>
          </div>
          {currencyTable?.length > 0 ? (
            <Table
              className="table"
              dataSource={currencyTable}
              columns={currencyTable?.length > 0 ? columns : []}
              rowKey={"id"}
              pagination={false}
              onScroll={nodeDebounce(handleScroll, 200)}
              scroll={{
                y: `26vh`,
              }}
            />
          ) : (
            <div className="no-data-box">
              <img src={noDataIcon} alt="" />
              <div>暂无数据</div>
            </div>
          )}
        </div>
      </Modal>
    </Fragment>
  );
};

export default CurrencyExchange;