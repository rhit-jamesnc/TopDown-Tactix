import { useTranslation } from 'react-i18next';
import type { BugDetailsModalProps } from '../../../../../shared/types/props'
import { formatLocalizedDate } from '../../../../../shared/utils/dateFormatter'
import './BugDetailsModal.css'

export const BugDetailsModal = ({ bug, isAdmin, onClose }: BugDetailsModalProps) => {
    const { t, i18n } = useTranslation();

    console.log("Bug Status Value:", `"${bug.status}"`);
    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('Details')}</h3>
            <p><strong>{t('Timestamp')}:</strong> {formatLocalizedDate(bug.timestamp, i18n.language)}</p>
            <p><strong>{t('Email')}:</strong> {isAdmin ? bug.email : "••••••••••••"}</p>

            <p>
                <strong>Status:</strong> 
                <span 
                    className="status-pill" 
                    data-status={bug.status}
                >
                    {bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}
                </span>
            </p>

            <p><strong>{t('description')}:</strong></p>
            <div className="full-description">
                <p>{bug.bug}</p>
            </div>
            <button onClick={onClose}>{t('Close')}</button>
        </div>
        </div>
    );
};