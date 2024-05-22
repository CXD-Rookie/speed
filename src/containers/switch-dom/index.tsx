import React from "react";
// import { Modal } from "antd";

import "./index.scss";

interface SwitchDomProps {}

const SwitchDom: React.FC<SwitchDomProps> = () => {
  return (
    <div className="switch-dom-module">
      <div className="info-switch">
        <span>00:50:21 亚服-北京-A508376（电信）</span>
        <span>切换</span>
      </div>
    </div>
  );
};

export default SwitchDom;
