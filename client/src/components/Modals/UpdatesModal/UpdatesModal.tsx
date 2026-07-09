import { useState } from 'react';
import type { UpdatesModalProps } from '../../../../../shared/types/props';
import './UpdatesModal.css';

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
    const [view, setView] = useState<'summary' | 'detailed'>('summary');

    return (
        <div className="updates-modal">
            <div className="updates-content">
                <button className="close-x" onClick={onClose}>&times;</button>
                
                {view === 'summary' ? (
                    <>
                        <h2>Recent Updates</h2>
                        <ul className="update-list">
                            <li><strong>CPU Difficulty:</strong> Selectable AI levels.</li>
                            <li><strong>Admin Auth:</strong> Secure multi-tier access.</li>
                            <li><strong>UI/UX:</strong> Refined transitions and layout.</li>
                        </ul>
                        <div className="button-group">
                            <button className="switch-btn" onClick={() => setView('detailed')}>View Details</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Detailed Logs</h2>
                        <div className="full-logs">
                            <h3>v1.2.0 - CPU Logic</h3>
                            <p>Implemented a robust AI engine allowing users to challenge the CPU with selectable difficulty levels ranging from Easy to Impossible.</p>
                            <h3>v1.1.5 - Admin Access</h3>
                            <p>Introduced a multi-tier authentication system using sessionStorage to manage Owner and Admin access levels securely.</p>
                            <h3>v1.1.0 - Interface</h3>
                            <p>Applied global styling fixes to the home screen and refined modal transitions for a smoother user experience.</p>
                        </div>
                        <div className="button-group">
                            <button className="switch-btn" onClick={() => setView('summary')}>Back</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};