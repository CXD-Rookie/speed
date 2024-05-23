import React, { useState } from "react";
import "./RegionTab.scss";

const RegionTab: React.FC = () => {
  const [currentGame, setCurrentGame] = useState("英雄联盟大吉大利");
  const [currentRegion, setCurrentRegion] = useState("亚服-所有服务器");

  const regions = [
    "亚服",
    "韩服",
    "东南亚服",
    "美服",
    "日服",
    "港服",
    "欧服",
    "俄服",
  ];

  return (
    <div className="region-tab">
      <div className="current-info">
        <p>当前游戏：{currentGame}</p>
        <p>当前区服：{currentRegion}</p>
      </div>
      <div className="region-buttons">
        {regions.map((region) => (
          <button key={region} onClick={() => setCurrentRegion(region)}>
            {region}
          </button>
        ))}
      </div>
      <button className="confirm-button">请选选择相关区服</button>
    </div>
  );
};

export default RegionTab;
