import './BugReportModal.css'

export const BugReportModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="bug-modal-overlay">
            <div className="bug-modal-content">
                <h2>Report a Bug</h2>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};