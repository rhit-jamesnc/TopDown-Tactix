import type { FeedbackModalProps } from '../../../../../shared/types/props';
import './FeedbackModal.css';

export const FeedbackModal = ({ message, onClose }: FeedbackModalProps) => {
    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal-content">
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};