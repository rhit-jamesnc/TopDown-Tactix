import React from 'react';
import type { ScoreboardProps } from '../../../../../shared/types/props';
import './Scoreboard.css';

export const Scoreboard = ({ scores, timeLeft, onPause }: ScoreboardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="scoreboard-wrapper">
      <div className="scoreboard-display">
        <div className="team-score">
          <span className="team-name">Home</span>
          <span className="score-value">{scores.home}</span>
        </div>
        
        <div className="timer-box">{formatTime(timeLeft)}</div>
        
        <div className="team-score">
          <span className="team-name">Away</span>
          <span className="score-value">{scores.away}</span>
        </div>
      </div>
      
      <button className="pause-button" onClick={onPause}>
        Pause
      </button>
    </div>
  );
};