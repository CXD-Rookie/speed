import React from "react";
import "./index.scss";

interface InputProps {
  placeholder?: string;
  value?: string;
  countdown?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (e: any) => void;
}

const CustomInput: React.FC<InputProps> = (props) => {
  const {
    placeholder = "",
    countdown = 0,
    prefix,
    suffix,
    value = "",
    onChange,
  } = props;

  return (
    <div className="visitor-login-custom-input-module">
      <div className="prefix">{prefix}</div>
      <input
        className={"input-com"}
        style={suffix ? { width: countdown > 0 ? "12vw" : "15vw" } : {}}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {suffix && <div className="suffix">{suffix}</div>}
    </div>
  );
};

export default CustomInput;
