import { useEffect, useState } from 'react';
import type { UpdatesModalProps, UpdateData } from '../../../../../shared/types/props';
import './UpdatesModal.css';

const UPDATE_FILES = ['ADMIN_DASHBOARD.md', 'AI_CPU_LOGIC.md'];

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [view, setView] = useState<'summary' | 'detailed'>('summary');
    const [data, setData] = useState<UpdateData | null>(null);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
      fetch(`/docs/updates/${UPDATE_FILES[currentIndex]}`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n');
          const parsedData: UpdateData = {
            title: lines[0],
            date: lines[1],
            version: lines[2],
            summary: lines[3],
            details: lines.slice(4).join('\n')
          };
          setData(parsedData);
        });
    }, [currentIndex]);

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

    if (!data) return null;

    return (
    <div className="updates-modal">
      <div className="updates-content">
        <button className="close-x" onClick={onClose}>&times;</button>
                
        <div className={`modal-body ${isFading ? 'fade-out' : 'fade-in'}`}>
            {view === 'summary' ? (
            <>
                <h2 className="header-standout">Recent Update: {data.title}</h2>
                <p className="date-text">{data.date}</p>
                <p><strong>{data.version} - {data.title}:</strong> {data.summary}</p>
                <button className="switch-btn" onClick={() => transitionView('detailed')}>View Details</button>
            </>
            ) : (
            <>
                <div className="detailed-view">
                    <h2 className="header-standout">{data.version} - {data.title}</h2>
                    <p className="date-text">{data.date}</p>
                    <div className="full-logs">
                        <p>{data.details}</p>
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
            disabled={currentIndex === UPDATE_FILES.length - 1}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};