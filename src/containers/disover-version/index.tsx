import { useSelector } from "react-redux";

import "./index.scss";

const DisoverVersion: React.FC = () => {
  const open = useSelector((state: any) => state?.modalOpen?.versionState);
  // const open = true
  
  return (
    open &&
      <div className="disover-version-module">
        <div className="disover-version-modal"></div>
        <div className="disover-version-mask" />
      </div>
  );
};

export default DisoverVersion;