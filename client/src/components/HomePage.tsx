import { useState } from 'react';
import './HomePage.css';

export const HomePage = ({ onStartGame }: { onStartGame: () => void }) => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="home-screen">
      <button className="help-btn" onClick={() => setShowHelp(true)}>?</button>

      {showHelp && (
        <div className="help-modal">
          <div className="help-content">
            <h2>How to Play</h2>
            <p>Use <b>WASD</b> or <b>Arrow Keys</b> to control your player.</p>
            <p>Navigate to the ball and drive it into the opponent's goal to score.</p>
            <button onClick={() => setShowHelp(false)}>Close</button>
          </div>
        </div>
      )}

      {/* <div className="status-banner">IN DEVELOPMENT</div> */}
      <h1>TopDown Tactix</h1>
      <p className="creator">Created By Noah James</p>
      <button className="preview-btn" onClick={onStartGame}>
          Preview Game
      </button>
      <a href="https://github.com/rhit-jamesnc/TopDown-Tactix" target="_blank" rel="noreferrer">
          GitHub Repository
      </a>
    </div>
  );
};