import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportedBugsModalProps, Bug } from '../../../../../shared/types/props';
import { formatLocalizedDate } from '../../../../../shared/utils/dateFormatter'
import { BugDetailsModal } from '../BugDetailsModal/BugDetailsModal';
import './ReportedBugsModal.css';

export const ReportedBugsModal = ({ bugs, isAdmin }: ReportedBugsModalProps) => {
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const { t, i18n } = useTranslation();

    if (!bugs || bugs.length === 0) {
        return <div className="no-bugs-message">{t('No Bugs Reported')}</div>;
    }

    return (
        <div className="reported-bugs-list">
        {bugs.map(bug => (
            <div key={bug.id} className="bug-item">
                <div className="bug-header">
                    <span className="timestamp">{formatLocalizedDate(bug.timestamp, i18n.language)}</span>
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
                        {t('View Details')}
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