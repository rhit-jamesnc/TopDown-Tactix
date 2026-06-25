import type { PauseMenuProps } from '../../../shared/types/props'
import './PauseMenuModal.css'

export const PauseMenuModal = ({ onResume, onQuit }: PauseMenuProps) => (
  <div className="pause-menu-overlay">
    <div className="pause-menu-content">
      <h2>Paused</h2>
      <button className="pause-menu-button" onClick={onResume}>Resume Game</button>
      <button className="pause-menu-button" onClick={onQuit}>Quit to Home</button>
    </div>
  </div>
);