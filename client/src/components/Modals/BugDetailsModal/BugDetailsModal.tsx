import type { BugDetailsModalProps } from '../../../../../shared/types/props'
import './BugDetailsModal.css'

export const BugDetailsModal = ({ bug, isAdmin, onClose }: BugDetailsModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Bug Details</h3>
        <p><strong>Timestamp:</strong> {bug.timestamp}</p>
        <p><strong>Email:</strong> {isAdmin ? bug.email : "••••••••••••"}</p>
        <div className="full-description">
            <strong>Description:</strong>
            <p>{bug.bug}</p>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};