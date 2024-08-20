import { useEffect, useState } from "react";
import { Select, Button } from "antd";

import IssueModal from "@/containers/IssueModal/index";

const { Option } = Select;

interface RegionProps {
  value: any;
  currentGameServer?: any;
  updateGamesRegion?: (a?: any, b?: any) => void;
  notice?: (value: any) => void;
}

const CustomRegion: React.FC<RegionProps> = (props) => {
  const {
    value = {},
    currentGameServer,
    updateGamesRegion = () => {},
  } = props;

  const [selectRegion, setSelectRegion] = useState<any>({}); // 当前选中的区服

  const [expandedPanels, setExpandedPanels] = useState<any>({}); // 点击区服是否选择的信息
  
  const [showIssueModal, setShowIssueModal] = useState(false); // 添加状态控制 SettingsModal 显示
  const [issueDescription, setIssueDescription] = useState<string | null>(null); // 添加状态控制 IssueModal 的默认描述

  // 选择的服
  const togglePanel = (option: any, type = "default") => {
    // 如果当前游戏服具有不同的区，进行更新节点操作
    let result: any = { ...option };

    if (option?.fu) {
      result = currentGameServer.filter(
        (item: any) => item?.qu === option?.fu
      )?.[0];
    }

    if (result?.children) {
      let isTrue =
        Object.keys(expandedPanels)?.length > 0 &&
        expandedPanels?.qu === option?.qu;
      setExpandedPanels(isTrue ? {} : result);
    }

    if (type === "default") {
      updateGamesRegion(value, option);
    }
  };

  useEffect(() => {
    if (Object.keys(value)?.length > 0) {
      const list = value?.serverNode?.region; // 区服列表
      const select = list.filter((item: any) => item?.is_select)?.[0]; // 默认选中的区服
      
      setSelectRegion(select);
    }
  }, [value]);

  return (
    <div className="content">
      <div className="current-box">
        <div className="current-game">
          <div className="current-text">当前游戏：</div>
          <div className="game-name">{value?.name}</div>
        </div>
        <div className="current-region">
          <div>当前区服：</div>
          <Select
            className="region-select"
            value={selectRegion?.qu}
            suffixIcon={<div className="triangle" />}
            onChange={(e, option) =>
              togglePanel(
                value?.serverNode?.region?.filter(
                  (child: any) => child?.qu === e
                )?.[0]
              )
            }
          >
            {value?.serverNode?.region?.map((item: any) => {
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
            return (
              <Button
                key={item.qu}
                onClick={() => {
                  togglePanel(item, item?.children ? "more" : "default");
                }}
                className={`${
                  (selectRegion?.qu === item?.qu ||
                    item?.children?.some(
                      (child: any) => child?.fu === selectRegion?.fu
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
            return (
              <Button
                key={item.qu}
                className={`${
                  selectRegion?.qu === item?.qu && "select-button"
                } region-button`}
                onClick={() => updateGamesRegion(value, item)}
              >
                {item.qu}
              </Button>
            );
          })}
      </div>
      <Button
        type="primary"
        className="start-button"
        // disabled={tableLoading}
        onClick={() => {
          // let isFind = identifyAccelerationData()?.[0] || {}; // 当前是否有加速数据
          // if (isFind && type === "details") {
          //   setAccelOpen(true);
          // } else {
          //   clickStartOn();
          // }
        }}
      >
        {/* {type === "details" ? "重新加速" : "开始加速"} */}
        开始加速
      </Button>
      <div
        className="not-have-region"
        onClick={() => {
          setShowIssueModal(true);
          setIssueDescription(`没有找到区服`);
        }}
      >
        没有找到区服？
      </div>
      {showIssueModal ? (
        <IssueModal
          showIssueModal={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          defaultInfo={issueDescription} // 传递默认描述
        />
      ) : null}
    </div>
  );
};

export default CustomRegion;
