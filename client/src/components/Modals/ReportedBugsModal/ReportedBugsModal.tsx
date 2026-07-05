import { useState } from 'react';
import type { ReportedBugsModalProps, Bug } from '../../../../../shared/types/props';
import { BugDetailsModal } from '../BugDetailsModal/BugDetailsModal';
import './ReportedBugsModal.css';

export const ReportedBugsModal = ({ bugs, isAdmin }: ReportedBugsModalProps) => {
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

    if (!bugs || bugs.length === 0) {
        return <div className="no-bugs-message">No Bugs Reported</div>;
    }

    return (
        <div className="reported-bugs-list">
        {bugs.map(bug => (
            <div key={bug.id} className="bug-item">
                <div className="bug-header">
                    <span className="timestamp">{bug.timestamp}</span>
                    {isAdmin ? (
                        <span className="email">{bug.email}</span>
                    ) : (
                        <span className="email-hidden">••••••••••••</span>
                    )}
                </div>
                <p className="bug-description">{bug.bug}</p>
                <div className="bug-footer">
                    <span className="status-active">{bug.status}</span>
                    <button className="view-details-btn" onClick={() => setSelectedBug(bug)}>
                        View Details
                    </button>
                </div>
            </div>
        ))}
        {selectedBug && (
            <BugDetailsModal 
                bug={selectedBug} 
                isAdmin={isAdmin} 
                onClose={() => setSelectedBug(null)} 
            />
        )}
        </div>
    );
};