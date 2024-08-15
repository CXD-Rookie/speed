import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

type MessageProps = {
  content: string;
  type?: 'success' | 'warning' | 'error';
  duration?: number;
  className?: string;
};

const Message: React.FC<MessageProps> = ({ content, type = 'success', duration = 3000, className = '' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById('custom-message');
      if (el) {
        ReactDOM.unmountComponentAtNode(el);
        document.body.removeChild(el);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`custom-message ${type} ${className}`}>
      {content}
    </div>
  );
};

export const showMessage = (props: MessageProps) => {
  const el = document.createElement('div');
  el.id = 'custom-message';
  document.body.appendChild(el);
  ReactDOM.render(<Message {...props} />, el);
};

export default Message;

