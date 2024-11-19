// 版本升级弹窗
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVersionState } from "@/redux/actions/modal-open";
import { Button } from "antd";

import "./index.scss";
import versionCloseIcon from "@/assets/images/common/version-close.svg";

const DisoverVersion: React.FC = () => {
  const { open = false, type = ''} = useSelector((state: any) => state?.modalOpen?.versionState);

  const dispatch = useDispatch();

  const [version, setVersion] = useState<any>({});
  const [note, setNote] = useState([]);

  // 进行关闭弹窗操作
  const onCancel = () => {
    dispatch(setVersionState({ open: false, })); // 关闭版本升级弹窗
  };

  // 点击更新进行重启升级
  const handleRenewal = () => {
    (window as any).stopProcessReset(); // 停止加速方法
    (window as any).native_update(); // 客户端方法重启更新
  };

  useEffect(() => {
    if (open) {
      const version = JSON.parse(localStorage.getItem("version") ?? JSON.stringify({}));
      const note = version?.note.split("；");
      
      setNote(note);
      setVersion(version);
    }
  }, [open]);

  return open ? (
    <div className="disover-version-module">
      <div className="disover-version-mask" />
      <div className="disover-version-modal">
        <img
          className="close-icon"
          src={versionCloseIcon}
          alt=""
          onClick={onCancel}
        />
        <div className="title-box">
          <div className="title">发现新版本！</div>
          <div className="version">V{version?.now_version}</div>
        </div>
        <div className="log-box">
          {note.map((item, index) => (
            <div className="log-text" key={index}>
              <div className="dot-box">
                <div className="dot" />
              </div>
              <div>{item}</div>
            </div>
          ))}
        </div>
        <Button className="renewal" type="primary" onClick={handleRenewal}>
          立即升级
        </Button>
      </div>
    </div>
  ) : null;
};

export default DisoverVersion;