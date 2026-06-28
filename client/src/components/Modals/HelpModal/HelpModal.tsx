import { useState } from 'react';
import type { HelpModalProps } from '../../../../../shared/types/props';
import './HelpModal.css';

type HelpView = 'main' | 'offline' | 'online';

export const HelpModal = ({ initialView = 'main', onClose }: HelpModalProps) => {
  const [view, setView] = useState<HelpView>(initialView);

  return (
    <div className="help-modal" onClick={onClose}>
      <div className="help-content" onClick={e => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>X</button>
        
        {view === 'main' && (
          <>
            <h2>How to Play</h2>
            <p>Select a game mode to see specific controls and rules.</p>
            <p>Press <b>Escape</b> at any time to pause the game.</p>
            <button onClick={() => setView('offline')}>1v1 Offline</button>
            <button onClick={() => setView('online')}>1v1 Online</button>
          </>
        )}
        
        {view === 'offline' && (
          <>
            <h2>1v1 Mode - Offline</h2>
            <p><b>Goal:</b> First to <b>5 goals</b> or most goals after <b>3 minutes</b> wins.</p>
            <p><b>Player 1 (Left):</b> Move with <b>WASD</b>.</p>
            <p><b>Player 2 (Right):</b> Move with <b>Arrow Keys</b>.</p>
            {initialView === 'main' ? (
              <button onClick={() => setView('main')}>Back</button>
            ) : (
              <button onClick={onClose}>Back</button>
            )}
          </>
        )}
        
        {view === 'online' && (
          <>
            <h2>1v1 Mode - Online</h2>
            <p><b>Goal:</b> First to <b>5 goals</b> or highest score after <b>3 minutes</b> wins.</p>
            <p><b>Controls:</b> Use <b>WASD</b> or <b>Arrow Keys</b> to move your player.</p>
            <p>The game automatically matches you with an online opponent.</p>
            {initialView === 'main' ? (
              <button onClick={() => setView('main')}>Back</button>
            ) : (
              <button onClick={onClose}>Close</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};