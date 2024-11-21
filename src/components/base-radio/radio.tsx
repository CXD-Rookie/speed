// 自定义单选框组件
import React, { useState, useEffect, ReactElement } from "react";

import "./index.scss";

export interface CustomRadioProps {
  value?: string;
  checked?: boolean;
  style?: React.CSSProperties;
  children?: ReactElement<CustomRadioProps> | ReactElement<CustomRadioProps>[];
  className?: string;
  onChange?: ((value: string) => void) | undefined;
}

const CustomRadio: React.FC = React.forwardRef<
  HTMLSpanElement,
  CustomRadioProps
>((props, ref) => {
  const {
    children,
    className = "",
    value,
    checked: checkedProp, // 避免内外checked变量导致冲突
    onChange,
  } = props;

  const [radioChecked, setRadioChecked] = useState(false);

  // 监听外部传值状态
  useEffect(() => {
    setRadioChecked(!!checkedProp);
  }, [checkedProp]);

  // 内部点击触发选中
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRadioChecked(true);

    if (onChange) {
      onChange(value || "");
    }
  };

  return (
    <span ref={ref} className={`speed-custom-radio-wrapper`} key={value}>
      {/* 边框 */}
      <span
        className={`speed-custom-radio ${
          radioChecked ? "speed-custom-radio-checked" : ""
        }${className}`}
        onClick={handleClick}
      >
        {/* 圆点 */}
        <span
          className={`${radioChecked && "speed-custom-radio-circle-checked"}`}
        />
      </span>
      {children}
    </span>
  );
});

export default CustomRadio;
