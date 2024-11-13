import { Fragment, useEffect, useRef, useState } from "react";
import { Button, Modal, Tabs } from "antd";
import { validityPeriod } from "@/containers/currency-exchange/utils";
import { nodeDebounce } from "@/common/utils";
import { useDispatch } from "react-redux";
import { setPayState } from "@/redux/actions/modal-open";

import "./index.scss";
import noIcon from "@/assets/images/common/no-data.svg";
import loseIcon from "@/assets/images/common/yishiyong.svg";
import expiresIcon from "@/assets/images/common/yiguoqi.svg";

interface CouponProps {
  open: boolean;
  setOpen: (event: boolean) => void;
  value?: any;
  makeParams?: any;
  fetchRecords?: (event: any, value: any) => void;
}
const inilitePagination = { page: 1, pagesize: 20 };

const CustonCoupon: React.FC<CouponProps> = (props) => {
  const {
    open,
    setOpen,
    value = [],
    fetchRecords = () => {},
    makeParams = {},
  } = props;
  const dispatch = useDispatch();
  const scrollRef: any = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("make");

  const [couponMaskData, setCouponMaskData] = useState<any>([]); // 未使用数据
  const [couponLoseData, setCouponLoseData] = useState<any>([]); // 已失效数据

  const [mouseoverState, setMouseoverState] = useState(false);

  const [loseSearch] = useState({ type: 2, status: "2,3" }); // 已失效类型参数
  const [losePagination, setLosePagination] = useState(inilitePagination); // 已失效分页参数
  const [loseTotal, setLoseTotal] = useState(0); // 已失效数量总数
  const [loseActiveNum, setLoseActiveNum] = useState(0); // 记录失效tab切换次数

  const onClose = () => {
    setOpen(false);
    setActiveTab("make");
    setLosePagination(inilitePagination)
  };

  const fetchLoseRecords = async (pagination = losePagination) => {
    try {
      const res: any = await fetchRecords(loseSearch, pagination);
      
      setLosePagination(pagination);
      setLoseTotal(res?.total);
      setCouponLoseData(
        pagination?.page > 1 ? [...couponLoseData, ...res?.data] : res?.data
      );
    } catch (error) {
      console.log(error);
    }
  };

  // 表格滚动
  async function handleScroll(e: any) {
    if (e.target.getAttribute("class") === "content-box") {
      let scrollTop = e.target.scrollTop;
      let clientHeight = e.target.clientHeight;
      let scrollHeight = e.target.scrollHeight;
      
      if (
        Math.ceil(scrollTop) + Math.ceil(clientHeight) + 1 >= scrollHeight
      ) {
        if (
          activeTab === "make" &&
          makeParams?.makeTotal > makeParams?.makeData?.length
        ) {
          const old_pagination = makeParams?.makePagination;
          const pagination = {
            ...old_pagination,
            page: old_pagination?.page + 1,
          };

          makeParams.setMakePagination(pagination);
          fetchRecords(makeParams?.makeSearch, pagination);
        } else if (activeTab === "lose" && loseTotal > couponLoseData?.length) {
          const pagination = {
            ...losePagination,
            page: losePagination?.page + 1,
          };

          fetchLoseRecords(pagination);
        }
      }
    }
  }

  useEffect(() => {
    setCouponMaskData(value);
  }, [value]);

  useEffect(() => {
    if (open) {
      fetchLoseRecords()
    }
  }, [open]);

  useEffect(() => {
    // 打开优惠券弹窗滚动条回到顶部
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  return (
    <Fragment>
      <Modal
        className="custon-coupon"
        open={open}
        onCancel={onClose}
        title="我的优惠券"
        width={"67.6vw"}
        centered
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            console.log(loseActiveNum, key);
            
            if (key === "lose" && loseActiveNum === 0) {
              scrollRef.current.scrollTop = 0;
              setLoseActiveNum(loseActiveNum + 1);
            }
          }}
          items={[
            {
              key: "make",
              label: `未使用（${makeParams?.makeTotal}）`,
              children: (
                <div className="coupon-tabs-content">
                  {couponMaskData?.length > 0 ? (
                    <div
                      className="content-box"
                      onScrollCapture={nodeDebounce(handleScroll, 200)}
                      ref={scrollRef}
                    >
                      {couponMaskData.map((mask: any) => {
                        const redeem_code = mask?.redeem_code;

                        return (
                          <div
                            className="mask-card card"
                            key={mask?.id}
                            style={{
                              borderColor: mouseoverState
                                ? "#f86c34"
                                : "transparent",
                            }}
                          >
                            <div className="icon-box">
                              <div className="left" />
                              <div className="right" />
                              {redeem_code?.content}折
                            </div>
                            <div className="text-box">
                              <div className="title">{redeem_code?.name}</div>
                              <div className="time-box">
                                <span
                                  style={
                                    validityPeriod(mask).indexOf("过期") === -1
                                      ? { color: "#999" }
                                      : {}
                                  }
                                >
                                  {validityPeriod(mask, "state")}
                                </span>
                                <Button
                                  type="default"
                                  onMouseOver={() => setMouseoverState(true)}
                                  onMouseLeave={() => setMouseoverState(false)}
                                  onClick={(e) => {
                                    dispatch(
                                      setPayState({
                                        open: true,
                                        couponValue: mask ?? {},
                                      })
                                    ); // 会员充值页面
                                    setOpen(false);
                                  }}
                                >
                                  立即使用
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-data-box">
                      <img src={noIcon} alt="" />
                      <div>暂无优惠券</div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "lose",
              label: `已失效（${loseTotal}）`,
              children: (
                <div className="coupon-tabs-content">
                  {couponLoseData?.length > 0 ? (
                    <div
                      className="content-box"
                      onScrollCapture={nodeDebounce(handleScroll, 200)}
                      ref={scrollRef}
                    >
                      {couponLoseData.map((lose: any) => {
                        const redeem_code = lose?.redeem_code;

                        return (
                          <div
                            className="lose-card card"
                            key={lose?.id}
                            style={{
                              borderColor: mouseoverState
                                ? "#f86c34"
                                : "transparent",
                            }}
                          >
                            <div className="icon-box">
                              <div className="left" />
                              <div className="right" />
                              {redeem_code?.content}折
                            </div>
                            <div className="text-box">
                              <div className="title">{redeem_code?.name}</div>
                              <div className="time-text">
                                有效期至{validityPeriod(lose)}
                              </div>
                            </div>
                            <img
                              className="lose-icon"
                              src={lose?.status === 2 ? loseIcon : expiresIcon}
                              alt=""
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-data-box">
                      <img src={noIcon} alt="" />
                      <div>暂无优惠券</div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </Fragment>
  );
};

export default CustonCoupon;