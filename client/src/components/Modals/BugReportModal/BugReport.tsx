import React, { useState } from 'react';
import { FeedbackModal } from '../FeedbackModal/FeedbackModal';
import './BugReportModal.css';

export const BugReportModal = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        
        const bugData = { 
            email, 
            description, 
            timestamp: new Date().toISOString() 
        };
        
        try {
            await fetch('https://script.google.com/macros/s/AKfycbwUGBeh5pKiVRl0wpWPWBFhopSulMdmfycEor_McPI6k9GgNNzScdcwmUNZuWqGKTNgQQ/exec', {
                method: 'POST',
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bugData)
            });
            
            setFeedback('Bug reported successfully!');
        } catch (error) {
            console.error('Submission failed:', error);
            setFeedback('Failed to send report. Please try again.');
        }
    };
    
    return (
        <>
            {feedback ? (
                <FeedbackModal message={feedback} onClose={onClose} />
            ) : (
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
            )}
        </>
    );
};