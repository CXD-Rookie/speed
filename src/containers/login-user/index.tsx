import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar, Popover } from "antd";
import "./index.scss";

interface CustomDropdownProps {}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const [userInfo, setUserInfo] = useState<any>({});

  useEffect(() => {
    let user_info = localStorage.getItem("userInfo");
    user_info = user_info ? JSON.parse(user_info) : {};

    setUserInfo(user_info);
  }, []);

  return (
    <div className="custom-dropdown">
      <Popover
        placement="bottomRight"
        trigger="click"
        arrow={false}
        content={
          <div className="dropdwon-conent">
            <div className="avatar-box">
              <div>
                <Avatar
                  size={20}
                  src={
                    userInfo?.user_info?.avatar ||
                    "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                  }
                />
                <span>{userInfo?.user_info?.nickname}</span>
              </div>
              <span>编辑</span>
            </div>
            <Button type={"primary"}>会员充值</Button>
            <p>解锁全新游戏体验，畅玩游戏从未有过的速度！</p>
          </div>
        }
      >
        <div className="user-text">
          <span>{userInfo?.user_info?.nickname}</span>
          <Avatar
            size={20}
            src={
              userInfo?.user_info?.avatar ||
              "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
            }
          />
        </div>
      </Popover>
    </div>
  );
};

export default CustomDropdown;
