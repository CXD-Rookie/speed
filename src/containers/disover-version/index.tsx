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
    // (window as any).native_update(); // 客户端方法重启更新
    (window as any).native_restart(); // 客户端方法重启
  };

  useEffect(() => {
    if (open) {
      let version = JSON.parse(localStorage.getItem("version") ?? JSON.stringify({}));
      const isWebInterim = compareVersions(
        version?.web_version || "1.0.0.1001",
        version?.now_version
      );
      
      // isWebInterim = true 则代表前者小
      version.max_version = isWebInterim
        ? version?.now_version
        : version?.web_version;
      
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