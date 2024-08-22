/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-23 16:01:09
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-10 18:31:42
 * @FilePath: \speed\src\containers\login-user\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Button, Popover } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { openRealNameModal } from "@/redux/actions/auth";

import MinorModal from "../minor";
import RealNameModal from "../real-name";
import UserAvatarCom from "./user-avatar";
import SettingsModal from "../setting";
import PayModal from "../Pay";
import "./index.scss";

interface CustomDropdownProps {}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const dispatch = useDispatch();

  const accountInfo: any = useSelector((state: any) => state.accountInfo);
  const isRealOpen = useSelector((state: any) => state.auth.isRealOpen);

  const [open, setOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpenVip, setIsModalOpenVip] = useState(false);

  const [minorType, setMinorType] = useState<string>("recharge"); // 是否成年 类型充值还是加速
  const [isMinorOpen, setIsMinorOpen] = useState(false); // 未成年是否充值，加速认证框

  // const [accountInfo, setAccountInfo] = useState<any>(); // 用户信息
  const [isFirst, setIsFirst] = useState(1);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isFirst === 1 || open) {
      setIsFirst(isFirst + 1);
    }
  }, [open]);

  useEffect(() => {
 
  }, [open]);

  const popoverContent = (isVip: boolean) => (
    <div>
      <div className="dropdown-content">
        <div className="avatar-box">
          <div>
            <UserAvatarCom
              isVip={accountInfo?.userInfo?.is_vip}
              isLogin={accountInfo?.isLogin}
            />
            <span
              style={{
                color: accountInfo?.userInfo.is_vip ? "#f2d4a6" : "#fff",
              }}
              className="name-text"
            >
              {accountInfo?.userInfo?.nickname}
            </span>
          </div>
          <span
            className={isVip ? "vips" : "novips"}
            onClick={() => {
              hide();
              setEditOpen(true);
            }}
          >
            编辑
          </span>
        </div>
        <Button
          onClick={() => {
            const isRealNamel = localStorage.getItem("isRealName");

            hide();

            if (isRealNamel === "1") {
              dispatch(openRealNameModal());
              return;
            } else if (!accountInfo?.userInfo?.user_ext?.is_adult) {
              setIsMinorOpen(true);
              setMinorType("recharge");
              return;
            } else {
              setIsModalOpenVip(true);
            }
          }}
          className={isVip ? "vip" : "novip"}
          type={"primary"}
        >
          {isVip ? "续费" : "会员充值"}
        </Button>

        {isVip ? (
          <p>
            会员到期：
            {formatDate(accountInfo?.userInfo.vip_expiration_time - 86400)}
          </p>
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
        open={open}
        onOpenChange={handleOpenChange}
        content={popoverContent(accountInfo?.userInfo.is_vip)}
      >
        <div className="user-text">
          <span
            style={{ color: accountInfo?.userInfo.is_vip ? "#f2d4a6" : "#fff" }}
          >
            {accountInfo?.userInfo?.nickname}
          </span>
          <UserAvatarCom
            isVip={accountInfo?.userInfo?.is_vip}
            isLogin={accountInfo?.isLogin}
          />
        </div>
      </Popover>
      {editOpen ? (
        <SettingsModal
          type="edit"
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {!!isModalOpenVip && (
        <PayModal
          isModalOpen={isModalOpenVip}
          setIsModalOpen={(e) => setIsModalOpenVip(e)}
        />
      )}
      {isRealOpen ? <RealNameModal /> : null}
      {isMinorOpen ? (
        <MinorModal
          isMinorOpen={isMinorOpen}
          setIsMinorOpen={setIsMinorOpen}
          type={minorType}
        />
      ) : null}
    </div>
  );
};

export default CustomDropdown;
