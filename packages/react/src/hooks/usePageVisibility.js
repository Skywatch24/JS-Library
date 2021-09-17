import React, {useState, useEffect} from 'react';
export const usePageVisibility = callback => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const onVisibilityChange = () => {
    setIsVisible(!document.hidden);
    callback();
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange, false);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  });

  return isVisible;
};
