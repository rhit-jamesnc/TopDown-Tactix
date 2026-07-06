import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BugDetailsModalProps } from '../../../../../shared/types/props'
import { formatLocalizedDate } from '../../../../../shared/utils/dateFormatter'
import './BugDetailsModal.css'

export const BugDetailsModal = ({ bug, isAdmin, onClose, onStatusChange }: BugDetailsModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { t, i18n } = useTranslation();

    const handleStatusSelect = (newStatus: string) => {
        if (onStatusChange) {
            onStatusChange(bug.id, newStatus);
        }
        setIsEditing(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('Details')}</h3>
            <p><strong>{t('Timestamp')}:</strong> {formatLocalizedDate(bug.timestamp, i18n.language)}</p>
            <p><strong>{t('Email')}:</strong> {isAdmin ? bug.email : "••••••••••••"}</p>

            <p>
                <strong className='status-header'>{t('Status: ')}</strong> 
                {isAdmin && isEditing ? (
                    <select 
                        className="status-dropdown"
                        value={bug.status}
                        onChange={(e) => handleStatusSelect(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                    >
                        <option value="Active">Active</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                ) : (
                    <span 
                        className="status-pill" 
                        data-status={bug.status} 
                        onClick={() => isAdmin && setIsEditing(true)}
                        style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                        title={isAdmin ? "Click to change status" : ""}
                    >
                        {bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}
                    </span>
                )}
            </p>

            <p><strong>{t('Description')}:</strong></p>
            <div className="full-description">
                <p>{bug.bug}</p>
            </div>
            <button onClick={onClose}>{t('Close')}</button>
        </div>
        </div>
    );
};