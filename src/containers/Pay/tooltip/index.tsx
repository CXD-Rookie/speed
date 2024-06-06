import React from "react";
import { Tooltip } from "antd";

import "./index.scss";

const TooltipCom: React.FC = () => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;

    (window as any).NativeApi_OpenBrowser(dataTitle);
  };

  return (
    <div className="tooltip-com-module">
      <Tooltip
        title={
          <div className="tooltip-com-module-content">
            <div className="title">自动续费服务声明</div>
            <div className="value">1、到期前24小时为您自动续费；</div>
            <div className="value">2、扣款前消息通知，完全透明；</div>
            <div className="value">3、自动续费可随时取消；</div>
            <div className="value">
              4、点击查看
              <span
                onClick={handleClick}
                data-title="https://cdn.accessorx.com/web/automatic_renewal_agreement.html"
              >
                自动续费协议
              </span>
              。
            </div>
          </div>
        }
      >
        <span className="tips">?</span>
      </Tooltip>
    </div>
  );
};

export default TooltipCom;
