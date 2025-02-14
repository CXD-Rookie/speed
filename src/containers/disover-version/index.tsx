// 版本升级弹窗
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVersionState } from "@/redux/actions/modal-open";
import { Button } from "antd";
import { compareVersions } from "@/layout/utils";

import "./index.scss";
import versionCloseIcon from "@/assets/images/common/version-close.svg";

const DisoverVersion: React.FC = () => {
  const { open = false } = useSelector((state: any) => state?.modalOpen?.versionState);

  const dispatch = useDispatch();

  const [version, setVersion] = useState<any>({});

  // 进行关闭弹窗操作
  const onCancel = () => {
    dispatch(setVersionState({ open: false, })); // 关闭版本升级弹窗
  };

  // 点击更新进行重启升级
  const handleRenewal = () => {
    (window as any).stopProcessReset(); // 停止加速方法

    // 当前客户端版本
    const versionNowRef = (window as any).versionNowRef;
    // 客户端版本是否进行更新
    const interim: any = compareVersions(
      versionNowRef || "1.0.0.1001",
      version?.now_version
    );
    
    if (interim?.relation === 2) {
      (window as any).native_update(); // 客户端方法重启更新
    } else {
      (window as any).native_restart(); // 客户端方法重启
    }
  };

  useEffect(() => {
    if (open) {
      let version = JSON.parse(localStorage.getItem("version") ?? JSON.stringify({}));
      const webInterim: any = compareVersions(
        version?.web_version || "1.0.0.1001",
        version?.now_version
      );
      
      version.max_version = webInterim?.max;
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
          <div className="version">V{version?.max_version}</div>
        </div>
        <div className="log-box">
          <pre className="log-text">{version?.note}</pre>
        </div>
        <Button className="renewal" type="primary" onClick={handleRenewal}>
          立即升级
        </Button>
      </div>
    </div>
  ) : null;
};

export default DisoverVersion;