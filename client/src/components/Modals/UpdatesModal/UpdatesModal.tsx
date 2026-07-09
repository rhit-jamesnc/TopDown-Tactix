import { useState } from 'react';
import type { UpdatesModalProps } from '../../../../../shared/types/props';
import './UpdatesModal.css';

export const UpdatesModal = ({ onClose }: UpdatesModalProps) => {
    const [view, setView] = useState<'summary' | 'detailed'>('summary');

    return (
        <div className="updates-modal">
                <div className="updates-content">
                    {view === 'summary' ? (
                <>
                    <h2>Recent Updates</h2>
                    <ul>
                        <li>Added CPU difficulty selection.</li>
                        <li>Improved admin authentication flow.</li>
                    </ul>
                    <div className="button-group">
                        <button onClick={() => setView('detailed')}>View Details</button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </>
                ) : (
                <>
                    <h2>Full Update Logs</h2>
                    <div className="full-logs">
                        <p><strong>v1.2.0:</strong> Refactored the engine for faster processing.</p>
                        <p><strong>v1.1.5:</strong> Added comprehensive CPU AI logic and difficulty tiers.</p>
                        <p><strong>v1.1.0:</strong> Security patches for the Admin dashboard.</p>
                    </div>
                    <div className="button-group">
                        <button onClick={() => setView('summary')}>View Summary</button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </>
                )}
            </div>
        </div>
    );
};