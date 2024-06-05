/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 10:28:50
 * @FilePath: \speed\src\containers\login-user\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import { Button, Avatar, Popover } from "antd";

import SettingsModal from "../setting";
import PayModal from "../Pay";
import "./index.scss";

interface CustomDropdownProps {}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const [userInfo, setUserInfo] = useState<any>({});
  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchUserInfo = () => {
      let user_info = localStorage.getItem("userInfo");
      user_info = user_info ? JSON.parse(user_info) : {};
      setUserInfo(user_info);
    };

    fetchUserInfo();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "userInfo") {
        fetchUserInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const popoverContent = (isVip: boolean) => (
    <div>
      <div className="dropdown-content">
        <div className="avatar-box">
          <div>
            <Avatar
              size={20}
              src={
                userInfo?.avatar ||
                "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              }
            />
            <span>{userInfo?.nickname}</span>
          </div>
          <span
            className={isVip ? "vips" : "novips"}
            onClick={() => setEditOpen(true)}
          >
            编辑
          </span>
        </div>
        <Button
          onClick={() => setIsModalOpenVip(true)}
          className={isVip ? "vip" : "novip"}
          type={"primary"}
        >
          {isVip ? "续费" : "会员充值"}
        </Button>

        {isVip ? (
          <p>会员到期：{formatDate(userInfo.vip_expiration_time)}</p>
        ) : (
          <p>解锁全新游戏体验，畅玩游戏从未有过的速度！</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="custom-dropdown">
      <Popover
        placement="bottomRight"
        trigger="click"
        arrow={false}
        content={popoverContent(userInfo.is_vip)}
      >
        <div className="user-text">
          <span>{userInfo?.nickname}</span>
          <Avatar
            size={20}
            src={
              userInfo?.avatar ||
              "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
            }
          />
        </div>
      </Popover>
      <SettingsModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => {
            console.log(e);
            setIsModalOpenVip(e);
          }}
        />
      )}
    </div>
  );
};

export default CustomDropdown;
