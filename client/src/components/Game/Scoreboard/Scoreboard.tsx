import React from 'react';
import './Scoreboard.css';

export const Scoreboard = () => {

  return (
    <div className="scoreboard-wrapper">
      <div className="scoreboard-display">
        <div className="team-score">
          <span className="team-name">Home</span>
          <span className="score-value">0</span>
        </div>
        
        <div className="timer-box">0:00</div>
        
        <div className="team-score">
          <span className="team-name">Away</span>
          <span className="score-value">0</span>
        </div>
      </div>
      
      <button className="pause-button">
        Pause
      </button>
    </div>
  );
};