import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar } from "antd";
import "./index.scss";

interface CustomDropdownProps {}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const [visible, setVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDocumentClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setVisible(false);
    }
  };

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    let user_info = localStorage.getItem("userInfo");
    user_info = user_info ? JSON.parse(user_info) : {};

    setUserInfo(user_info);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className={"children-content"} onClick={toggleDropdown}>
        <div>
          <span>{userInfo?.user_info?.nickname}</span>
          <Avatar size={20} src="path/to/avatar.jpg" />
        </div>
      </div>
      {visible && (
        <div className={`dropdown-menu ${"bottomRight"}`} ref={menuRef}>
          <div className="dropdwon-conent">
            <div>
              <Avatar size={20} src="path/to/avatar.jpg" />
              &nbsp;
              {userInfo?.user_info?.nickname} <span>编辑</span>
            </div>
            <Button type={"primary"}>会员充值</Button>
            <p>解锁全新游戏体验，畅玩游戏从未有过的速度！</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
