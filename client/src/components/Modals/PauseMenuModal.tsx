import { useState } from 'react';
import { HelpModal } from './HelpModal';
import type { PauseMenuProps } from '../../../../shared/types/props'
import '../Styles/PauseMenuModal.css'

export const PauseMenuModal = ({ onResume, onQuit, pauseTimeLeft }: PauseMenuProps) => {
  const [view, setView] = useState<'menu' | 'help'>('menu');

  if (view === 'help') {
    return (
      <HelpModal 
        initialView="offline" 
        onClose={() => setView('menu')}
      />
    );
  }

  return (
    <div className="pause-menu-overlay">
      <div className="pause-menu-content">
        <h2>Paused</h2>

        {pauseTimeLeft !== undefined && (
          <p>Time remaining: {Math.ceil(pauseTimeLeft)}s</p>
        )}
        
        <button className="pause-menu-button" onClick={onResume}>Resume Game</button>
        <button className="pause-menu-button" onClick={() => setView('help')}>How to Play</button>
        <button className="pause-menu-button" onClick={onQuit}>Quit to Home</button>
      </div>
    </div>
  );
};