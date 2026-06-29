import { useState, useEffect } from 'react';
import type { CountdownOverlayProps } from '../../../../../shared/types/props'
import './CountdownOverlay.css';

export const CountdownOverlay = ({ duration, onCountdownComplete, onStateChange }: CountdownOverlayProps) => {
  const [count, setCount] = useState<number>(duration);
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
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onStateChange, onCountdownComplete]);

  if (!isVisible) return null;

  return (
    <div className="countdown-overlay">
      <div className={`countdown-number ${count <= 0 ? 'go' : ''}`}>
        {count <= 0 ? 'GO!' : count}
      </div>
    </div>
  );
};