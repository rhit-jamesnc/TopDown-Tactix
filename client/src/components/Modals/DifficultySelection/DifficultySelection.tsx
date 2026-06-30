import type { DifficultySelectionProps } from '../../../../../shared/types/props'
import './DifficultySelection.css';

export const DifficultySelection = ({ onSelect, onBack }: DifficultySelectionProps) => {
  return (
    <div className="difficulty-overlay">
        <div className="difficulty-modal">
            <h1>Select Difficulty</h1>
            
            <div className="difficulty-grid">
                <button className="difficulty-card" onClick={() => onSelect('academy')}>
                    <h3>Academy</h3>
                    <p>Learn the ropes and master the controls.</p>
                </button>

                <button className="difficulty-card" onClick={() => onSelect('reserves')}>
                    <h3>Reserves</h3>
                    <p>Fight for a spot in the starting lineup.</p>
                </button>

                <button className="difficulty-card" onClick={() => onSelect('first-team')}>
                    <h3>First Team</h3>
                    <p>Face the elite. No room for mistakes.</p>
                </button>
            </div>

            <button className="back-btn" onClick={onBack}>Back</button>
        </div>
    </div>
  );
};