// 自定义单选框组件
import React, { useState, useEffect } from "react";

import "./index.scss";

export interface CustomRadioProps {
  value?: string;
  style?: React.CSSProperties;
  className?: string;
  onChange?: ((value: object) => void) | undefined;
}

const CustomRadio: React.FC<CustomRadioProps> = (props) => {
  const { className = "", value } = props;

  const [radioChecked, setRadioChecked] = useState(false);

  const handleClick = (e: any) => {
    setRadioChecked(true);
  };

  useEffect(() => {
    return () => {};
  }, [value]);

  return (
    <span
      className={`speed-custom-radio ${
        radioChecked && "speed-custom-radio-checked"
      }${className}`}
      onClick={handleClick}
    >
      <span
        className={`${radioChecked && "speed-custom-radio-circle-checked"}`}
      />
    </span>
  );
};

export default CustomRadio;
