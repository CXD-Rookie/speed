import React from "react";
import "./index.scss";

interface InputProps {
  placeholder?: string;
  value?: string;
  countdown?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  source?: string;
  onChange?: (e: any) => void;
  onEnter?: () => void;
}

const CustomInput: React.FC<InputProps> = (props) => {
  const {
    placeholder = "",
    countdown = 0,
    prefix,
    suffix,
    source = "",
    value = "",
    onChange,
    onEnter = () => {},
  } = props;

  // 处理回车事件
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && source === "verify_code") {
      onEnter();
    }
  };

  return (
    <div className="custom-input-module">
      <div className="prefix">{prefix}</div>
      <input
        className={"input-com"}
        style={suffix ? { width: countdown > 0 ? "12vw" : "15vw" } : {}}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyPress}
      />
      {suffix && <div className="suffix">{suffix}</div>}
    </div>
  );
};

export default CustomInput;
