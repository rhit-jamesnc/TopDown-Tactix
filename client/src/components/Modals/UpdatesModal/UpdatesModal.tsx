import { useState } from 'react';
import type { UpdatesModalProps } from '../../../../../shared/types/props';
import './UpdatesModal.css';

const UPDATES_DATA = [
  {
    version: "v1.2.0",
    title: "CPU Logic",
    summary: "Implemented a robust AI engine for CPU difficulty levels.",
    details: "Implemented a robust AI engine allowing users to challenge the CPU with selectable difficulty levels ranging from Easy to Impossible. This required refactoring the turn-based state machine."
  },
  {
    version: "v1.1.5",
    title: "Admin Access",
    summary: "Introduced secure multi-tier authentication.",
    details: "Introduced a multi-tier authentication system using sessionStorage to manage Owner and Admin access levels securely, preventing unauthorized access to the admin dashboard."
  }
];

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [view, setView] = useState<'summary' | 'detailed'>('summary');

    const currentUpdate = UPDATES_DATA[currentIndex];

    const handleNext = () => {
        if (currentIndex < UPDATES_DATA.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setView('summary');
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setView('summary');
        }
    };

    return (
    <div className="updates-modal">
      <div className="updates-content">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <h2>{view === 'summary' ? "Recent Update" : currentUpdate.version}</h2>
        
        {view === 'summary' ? (
          <>
            <p><strong>{currentUpdate.title}:</strong> {currentUpdate.summary}</p>
            <div className="button-group">
              <button className="switch-btn" onClick={() => setView('detailed')}>View Details</button>
            </div>
          </>
        ) : (
          <>
            <div className="full-logs">
              <p>{currentUpdate.details}</p>
            </div>
            <div className="button-group">
              <button className="switch-btn" onClick={() => setView('summary')}>Back</button>
            </div>
          </>
        )}

        <div className="nav-controls">
          <button 
            className="nav-btn" 
            onClick={handleBack} 
            disabled={currentIndex === 0}
          >
            &larr; Previous
          </button>
          <button 
            className="nav-btn" 
            onClick={handleNext} 
            disabled={currentIndex === UPDATES_DATA.length - 1}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};