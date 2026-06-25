import { useState } from 'react';
import { InDevelopmentModal } from './InDevelopmentModal';
import type { HomePageProps } from "../../../shared/types/props"
import './HomePage.css';

export const HomePage = ({ onStartOffline, onStartOnline }: HomePageProps) => {
  const [helpView, setHelpView] = useState<'closed' | 'main' | 'offline' | 'online'>('closed');
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
                <button onClick={() => setHelpView('online')}>1v1 Online</button>
              </>
            )}
            {helpView === 'offline' && (
              <>
                <h2>1v1 Mode - Offline</h2>
                <p><b>Goal:</b> First to <b>5 goals</b> or most goals after <b>3 minutes</b> wins.</p>
                <p><b>Player 1 (Left):</b> Move with <b>WASD</b>.</p>
                <p><b>Player 2 (Right):</b> Move with <b>Arrow Keys</b>.</p>
                <button onClick={() => setHelpView('main')}>Back</button>
              </>
            )}
            {helpView === 'online' && (
              <>
                <h2>1v1 Mode - Online</h2>
                <p><b>Goal:</b> First to <b>5 goals</b> or highest score after <b>3 minutes</b> wins.</p>
                <p><b>Controls:</b> Use <b>WASD</b> or <b>Arrow Keys</b> to move your player.</p>
                <p>The game automatically matches you with an online opponent.</p>
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