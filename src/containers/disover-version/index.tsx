import { useSelector } from "react-redux";

import "./index.scss";

const DisoverVersion: React.FC = () => {
  const open = useSelector((state: any) => state?.modalOpen?.versionState);
  // const open = true
  
  return (
    open && (
      <div className="disover-version-module">
        <div className="disover-version-mask" />
        <div className="disover-version-modal">
          <div className="title-box">
            <div className="title">发现新版本！</div>
            <div className="version">V10.0.001</div>
          </div>
        </div>
      </div>
    )
  );
};

export default DisoverVersion;