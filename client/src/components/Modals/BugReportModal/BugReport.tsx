import './BugReportModal.css';

export const BugReportModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="bug-modal-overlay">
            <div className="bug-modal-content">
                <h2>Report a Bug</h2>
                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" placeholder="your@email.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea id="description" placeholder="Describe the issue..." required />
                    </div>
                    <div className="button-group">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};