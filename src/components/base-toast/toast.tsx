import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  backgroundColor?: string;
  color?: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  backgroundColor = "#000",
  color = "#fff",
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "1vw 2vw",
    borderRadius: "0.4vw",
    backgroundColor: backgroundColor,
    color: color,
    fontSize: "1.2vw",
    zIndex: 1000,
    animation: "fadeIn 0.3s ease",
    border: "0.1vw rgba(255,255,255,0.2) solid",
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
      <div style={toastStyle}>{message}</div>
    </>
  );
};

export default Toast;
