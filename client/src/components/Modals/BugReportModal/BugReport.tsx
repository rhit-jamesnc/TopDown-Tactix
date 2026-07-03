import './BugReportModal.css';

export const BugReportModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="bug-modal-overlay">
            <div className="bug-modal-content">
                <h2>Report a Bug</h2>
                <form>
                    <label>
                        Email:
                        <input type="email" required />
                    </label>
                    <label>
                        Description:
                        <textarea required />
                    </label>
                    <div className="button-group">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};