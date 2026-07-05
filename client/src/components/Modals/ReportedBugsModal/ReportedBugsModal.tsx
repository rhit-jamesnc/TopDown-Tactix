import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportedBugsModalProps, Bug } from '../../../../../shared/types/props';
import { formatLocalizedDate } from '../../../../../shared/utils/dateFormatter'
import { BugDetailsModal } from '../BugDetailsModal/BugDetailsModal';
import { updateBugStatus } from '../../../../../shared/utils/googleSheets';
import './ReportedBugsModal.css';

export const ReportedBugsModal = ({ bugs, isAdmin }: ReportedBugsModalProps) => {
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const { t, i18n } = useTranslation();

    const handleStatusChange = async (bugId: number | string, newStatus: string) => {
        setOptimisticStatuses(prev => ({ ...prev, [bugId]: newStatus }));
        setEditingId(null);
        
        try {
            await updateBugStatus(Number(bugId), newStatus);
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    if (!bugs || bugs.length === 0) {
        return <div className="no-bugs-message">{t('No Bugs Reported')}</div>;
    }

    return (
        <div className="reported-bugs-list">
        {bugs.map(bug => {
            const displayStatus = optimisticStatuses[bug.id] || bug.status;

            return (
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
                    {isAdmin && editingId === bug.id ? (
                        <select 
                            className="status-dropdown"
                            value={displayStatus}
                            onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            autoFocus
                        >
                            <option value="Active">Active</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                    ) : (
                        <span 
                            className="status-pill" 
                            data-status={displayStatus}
                            onClick={() => isAdmin && setEditingId(bug.id)}
                            style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                            title={isAdmin ? "Click to change status" : ""}
                        >
                            {displayStatus.charAt(0) + displayStatus.slice(1)}
                        </span>
                    )}
                    <button className="view-details-btn" onClick={() => setSelectedBug(bug)}>
                        {t('View Details')}
                    </button>
                </div>
            </div>
            );
        })}
        {selectedBug && (
            <BugDetailsModal 
                bug={{ ...selectedBug, status: optimisticStatuses[selectedBug.id] || selectedBug.status } as Bug}
                isAdmin={isAdmin} 
                onClose={() => setSelectedBug(null)} 
                onStatusChange={handleStatusChange}
            />
        )}
        </div>
    );
};