import { useCallback } from 'react';

const useCefQuery = () => {
  const sendMessageToBackend = useCallback((message, onSuccess, onFailure) => {
    if (window.cefQuery) {
      window.cefQuery({
        request: message,
        onSuccess: function (response) {
          if (onSuccess) {
            onSuccess(response);
          }
        },
        onFailure: function (errorCode, errorMessage) {
          if (onFailure) {
            onFailure(errorCode, errorMessage);
          }
        }
      });
    } else {
      console.warn('window.cefQuery is not available');
    }
  }, []);

  return sendMessageToBackend;
};

export default useCefQuery;
