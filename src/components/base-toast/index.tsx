import React from "react";
import ReactDOM from "react-dom";
import Toast from "./toast";

interface ToastOptions {
  message: string;
  duration?: number;
  backgroundColor?: string;
  color?: string;
}

const toast = {
  show: (options: ToastOptions) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    };

    ReactDOM.render(
      <Toast
        message={options.message}
        duration={options.duration}
        backgroundColor={options.backgroundColor}
        color={options.color}
        onClose={handleClose}
      />,
      container
    );
  },
};

export default toast;
