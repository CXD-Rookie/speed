import { useEffect, useState } from "react";
import { Button } from "antd";
import { useDispatch } from "react-redux";
import { setFeedbackPopup } from "@/redux/actions/modal-open";

import "./index.scss";

interface RegionProps {
  value: any;
  currentGameServer?: any;
  type?: string;
  startAcceleration?: (node?: any) => void;
  notice?: (value: any) => void;
  setSelectNode?: (value: any) => void;
  selectNode?: any;
  selectRegion?: any;
  setSelectRegion?: (value: any) => void;
  generateRSuit?: (value?: any, current?: any, region?: any) => void;
}

const CustomRegion: React.FC<RegionProps> = (props) => {
  const {
    value = {}, // 当前游戏信息
    currentGameServer,
    type,
    startAcceleration = () => {},
    setSelectNode = () => {},
    selectNode,
    selectRegion,
    generateRSuit = () => {},
  } = props;

  const dispatch = useDispatch();

  const [expandedPanels, setExpandedPanels] = useState<any>({}); // 点击区服是否选择的信息
  const [isClicking, setIsClicking] = useState(false); // 如果点击了加速立即禁用第二次点击，避免多次点击

  // 选择的服
  const togglePanel = (option: any, type = "default") => {
    // 如果当前游戏服具有不同的区，进行更新节点操作
    let result: any = { ...option };
    
    setSelectNode({});

    if (option?.fu) {
      result = currentGameServer.filter(
        (item: any) => item?.qu === option?.fu
      )?.[0];
    }

    // 如果区服结构是具有多层结构时
    if (result?.children) {
      let isTrue =
        Object.keys(expandedPanels)?.length > 0 &&
        expandedPanels?.qu === option?.qu;
      setExpandedPanels(isTrue ? {} : result);
    }
    
    // 如果区服结构是单层结构时如 steam
    if (type === "default") {
      generateRSuit(value, option, currentGameServer);
    }
  };

  useEffect(() => {
    if (Object.keys(value)?.length > 0) {
      const expand =
        (currentGameServer || []).filter(
          (item: any) => selectRegion?.fu && selectRegion?.fu === item?.qu
        )?.[0] || {}; // 初始化判断是否有选中的多级区服
      
      setExpandedPanels(expand);
    }
  }, [value]);

  return (
    <div className="content">
      <div className="current-box">
        {value?.name}{" "}
        {(selectRegion?.qu &&
          " | " + selectRegion?.qu + " | " + (selectNode?.name ||
          "智能节点")) }
        {} {}
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
                onClick={() => generateRSuit(value, item, currentGameServer)}
              >
                {item.qu}
              </Button>
            );
          })}
      </div>
      <div
        className="not-have-region"
        onClick={() =>
          dispatch(
            setFeedbackPopup({ open: true, defaultInfo: value?.name + "，缺少区服：" })
          )
        }
      >
        没有找到区服？
      </div>
      <Button
        type="primary"
        className="region-start-button"
        disabled={!selectRegion?.qu}
        onClick={async () => {
          setIsClicking(true);

          if (!isClicking) {
            await startAcceleration();
          }

          setIsClicking(false);
        }}
      >
        {type === "details" ? "重新加速" : "开始加速"}
      </Button>
    </div>
  );
};

export default CustomRegion;
