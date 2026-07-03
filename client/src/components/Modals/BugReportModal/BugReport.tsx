import { useState } from 'react';
import './BugReportModal.css';

export const BugReportModal = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        
        const bugData = { email, description, timestamp: new Date().toISOString() };
        
        console.log('Sending bug report:', bugData);
        
        alert('Bug reported successfully! (Pending API connection)');
        onClose();
    };
    
    return (
        <div className="bug-modal-overlay">
            <div className="bug-modal-content">
                <h2>Report a Bug</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input 
                            type="email" id="email" required 
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea 
                            id="description" required 
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        />
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