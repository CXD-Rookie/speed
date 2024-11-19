/*
 * @Author: zhangda
 * @Date: 2023-09-12 14:13:15
 * @LastEditors: zhangda
 * @LastEditTime: 2023-09-14 11:15:40
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \rongma-ui\src\rm-input\rm-input.tsx
 */
import type { ChangeEvent, KeyboardEvent } from "react";
import React from "react";
import classNames from "classnames";

export interface RmInputProps {
  defaultValue?: string;
  maxLength?: number;
  value?: string;
  placeholder?: string;
  bordered?: boolean;
  disabled?: boolean;
  showCount?: boolean;
  size?: "middle" | "small" | "large"; // 输入框类型 默认 middle
  onChange?: ((value: object) => void) | undefined;
  onPressEnter?: ((value: string) => void) | undefined;
  style?: React.CSSProperties;
  className?: string;
}

const RmInput: React.FC<RmInputProps> = (props) => {
  const {
    placeholder,
    disabled = false,
    onChange,
    onPressEnter,
    style,
    ...rest
  } = props;

  const className = classNames("rm-input-box", props.className || {});
  const defaultStyle = {};

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handlePressEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (onPressEnter) {
      onPressEnter(value);
    }
  };

  return (
    <span className={className}>
    </span>
  );
};

export default RmInput;
