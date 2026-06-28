import React, { useState, useEffect } from 'react';
import './CountdownOverlay.css';

export const CountdownOverlay = ({ onCountdownComplete, onStateChange }) => {
  const [count, setCount] = useState(5);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ isFrozen: true });
    }

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          
          setTimeout(() => {
            setIsVisible(false);
            if (onStateChange) onStateChange({ isFrozen: false });
            if (onCountdownComplete) onCountdownComplete();
          }, 800);
          
          return 'GO!';
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCountdownComplete, onStateChange]);

  if (!isVisible) return null;

  return (
    <div className="countdown-overlay">
      <div className={`countdown-number ${typeof count === 'string' ? 'go' : ''}`}>
        {count}
      </div>
    </div>
  );
};