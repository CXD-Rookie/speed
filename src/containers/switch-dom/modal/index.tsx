import React, { useState } from "react";
import "./index.scss";
import RegionTab from "../RegionTab";
import NodeTab from "../NodeTab";

interface ModalProps {
  show: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("region");

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>区服</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-tabs">
          <button
            className={activeTab === "region" ? "active" : ""}
            onClick={() => setActiveTab("region")}
          >
            区服
          </button>
          <button
            className={activeTab === "node" ? "active" : ""}
            onClick={() => setActiveTab("node")}
          >
            节点
          </button>
        </div>
        <div className="modal-content">
          {activeTab === "region" && <RegionTab />}
          {activeTab === "node" && <NodeTab />}
        </div>
      </div>
    </div>
  );
};

export default Modal;
