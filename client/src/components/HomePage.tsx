import { useState } from 'react';
import './HomePage.css';

export const HomePage = ({ onStartGame }: { onStartGame: () => void }) => {
  const [helpView, setHelpView] = useState<'closed' | 'main' | 'offline'>('closed');
  
  return (
    <div className="home-screen">
      <button className="help-btn" onClick={() => setHelpView('main')}>?</button>
      
      {helpView !== 'closed' && (
        <div className="help-modal" onClick={() => setHelpView('closed')}>
          <div className="help-content" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={() => setHelpView('closed')}>X</button>
            {helpView === 'main' && (
              <>
                <h2>How to Play</h2>
                <p>Select a game mode to see specific controls and rules.</p>
                <button onClick={() => setHelpView('offline')}>1v1 Offline</button>
              </>
            )}
            {helpView === 'offline' && (
              <>
                <h2>1v1 Mode</h2>
                <p><b>Player 1:</b> WASD to move.</p>
                <p><b>Player 2:</b> Arrow Keys to move.</p>
                <p>Whoever has the highest score at the end of the time wins!</p>
                <button onClick={() => setHelpView('main')}>Back</button>
              </>
            )}
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