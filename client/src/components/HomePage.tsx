import { useState } from 'react';
import { InDevelopmentModal } from './InDevelopmentModal';
import './HomePage.css';

interface HomePageProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
}

export const HomePage = ({ onStartOffline, onStartOnline }: HomePageProps) => {
  const [helpView, setHelpView] = useState<'closed' | 'main' | 'offline'>('closed');
  const [showDevModal, setShowDevModal] = useState(true);
  
  return (
    <div className="home-screen">
      {showDevModal && <InDevelopmentModal onClose={() => setShowDevModal(false)} />}

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

      <h1>TopDown Tactix</h1>
      <p className="creator">Created By Noah James</p>
      <button className="preview-btn" onClick={onStartOffline}>
          Offline
      </button>
      <button className="preview-btn" onClick={onStartOnline}>
          Online
      </button>
      <a href="https://github.com/rhit-jamesnc/TopDown-Tactix" target="_blank" rel="noreferrer">
          GitHub Repository
      </a>
    </div>
  );
};