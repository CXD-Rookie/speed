// 资源缓存区
import React, { Fragment } from "react";

import loadingGif from "@/assets/images/common/jiazai.gif";

const ResourceCache: React.FC = () => {
  return (
    <Fragment>
      <img
        style={{ display: "none" }}
        src={loadingGif}
        alt=""
      />
    </Fragment>
  );
};

export default ResourceCache;
