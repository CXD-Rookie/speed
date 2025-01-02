/*
 * @Author: zhangda
 * @Date: 2024-12-30 15:09:24
 * @LastEditors: zhangda
 * @LastEditTime: 2025-01-02 10:37:02
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \base-code\components\Tooltip\index.tsx
 */
import React, { useState, useRef, useEffect } from "react";
import "./index.scss";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  delay = 200,
  className = "",
  disabled = false,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`tooltip-container ${className}`}
      style={style}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <div className="tooltip-children">{children}</div>
      {isVisible && !disabled && (
        <div ref={tooltipRef} className={`tooltip-content ${placement}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
