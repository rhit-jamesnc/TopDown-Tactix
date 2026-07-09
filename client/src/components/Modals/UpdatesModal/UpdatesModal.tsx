import { useState } from 'react';
import type { UpdatesModalProps } from '../../../../../shared/types/props';
import './UpdatesModal.css';

const UPDATES_DATA = [
  {
    version: "v1.1.5",
    title: "Admin Access",
    date: "2026-07-9",
    summary: "Introduced secure multi-tier authentication.",
    details: "Introduced a multi-tier authentication system using sessionStorage to manage Owner and Admin access levels securely, preventing unauthorized access to the admin dashboard."
  },
  {
    version: "v1.2.0",
    title: "CPU Logic",
    date: "2026-06-15",
    summary: "Implemented a robust AI engine for CPU difficulty levels.",
    details: "Implemented a robust AI engine allowing users to challenge the CPU with selectable difficulty levels ranging from Easy to Impossible. This required refactoring the turn-based state machine."
  }
];

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [view, setView] = useState<'summary' | 'detailed'>('summary');
    const [isFading, setIsFading] = useState(false);

    const transitionView = (newView: 'summary' | 'detailed', direction?: 'next' | 'prev') => {
        setIsFading(true);
        setTimeout(() => {
            if (direction === 'next') {
                setCurrentIndex(i => i + 1);
            } else if (direction === 'prev') {
                setCurrentIndex(i => i - 1);
            }
            
            setView(newView);
            setIsFading(false);
        }, 300);
    };

    const currentUpdate = UPDATES_DATA[currentIndex];

    return (
    <div className="updates-modal">
      <div className="updates-content">
        <button className="close-x" onClick={onClose}>&times;</button>
                
        <div className={`modal-body ${isFading ? 'fade-out' : 'fade-in'}`}>
            {view === 'summary' ? (
            <>
                <h2 className="header-standout">Recent Update: {currentUpdate.title}</h2>
                <p className="date-text">{currentUpdate.date}</p>
                <p><strong>{currentUpdate.version} - {currentUpdate.title}:</strong> {currentUpdate.summary}</p>
                <button className="switch-btn" onClick={() => transitionView('detailed')}>View Details</button>
            </>
            ) : (
            <>
                <div className="detailed-view">
                    <h2 className="header-standout">{currentUpdate.version} - {currentUpdate.title}</h2>
                    <p className="date-text">{currentUpdate.date}</p>
                    <div className="full-logs">
                        <p>{currentUpdate.details}</p>
                    </div>
                    <button className="switch-btn" onClick={() => transitionView('summary')}>Back to Summary</button>
                </div>
            </>
            )}
        </div>

        <div className="nav-controls">
          <button 
            className="nav-btn" 
            onClick={() => transitionView('summary', 'prev')}
            disabled={currentIndex === 0}
          >
            &larr; Previous
          </button>
          <button 
            className="nav-btn" 
            onClick={() => transitionView('summary', 'next')}
            disabled={currentIndex === UPDATES_DATA.length - 1}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};