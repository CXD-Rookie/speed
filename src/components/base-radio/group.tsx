// 自定义单选框组件
import React, { useState, useEffect, cloneElement } from "react";
import type { CustomRadioProps } from "./radio";

import "./index.scss";
export interface GroupProps extends CustomRadioProps {
  compact?: boolean;
}

const CustomGroup: React.FC<GroupProps> = (props: any) => {
  const { children, value, onChange } = props;

  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
    
    if (onChange) {
      onChange(value);
    }
  };

  const renderChildren = () => {
    if (Array.isArray(children)) {
      return children.map((child, index) =>
        // 克隆并返回一个新的 React 元素
        cloneElement(child, {
          key: child.props.value || index, // 添加 key 属性
          checked: child.props.value === selectedValue,
          onChange: handleRadioChange,
        })
      );
    } else {
      return cloneElement(children, {
        key: children.props.value, // 添加 key 属性
        checked: children.props.value === selectedValue,
        onChange: handleRadioChange,
      });
    }
  };

  useEffect(() => {
    return () => {};
  }, [value]);

  return (
    <span className={`speed-custom-radio-group`}>
      {renderChildren()}
    </span>
  );
};

export default CustomGroup;
