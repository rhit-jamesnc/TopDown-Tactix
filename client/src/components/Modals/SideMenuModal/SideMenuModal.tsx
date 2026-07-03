import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BugReportModal } from '../BugReportModal/BugReport';
import { AdminPasswordModal } from '../AdminPasswordModal/AdminPasswordModal';
import { FeedbackModal } from '../FeedbackModal/FeedbackModal';
import { ADMIN_CONFIG } from '../../../../../shared/config/adminConfig'
import type { SideMenuProps } from '../../../../../shared/types/props';
import './SideMenuModal.css';

export const SideMenu = ({ isOpen }: SideMenuProps) => {
    const [lastUpdated, setLastUpdated] = useState('Loading...');
    const [showBugModal, setShowBugModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const navigate = useNavigate();

    const handleVerify = (password: string) => {
        if (password === ADMIN_CONFIG.PASSWORDS.OWNER) {
            sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.OWNER);
            navigate('/admin');
        } else if (password === ADMIN_CONFIG.PASSWORDS.OTHER) {
            sessionStorage.setItem('adminType', ADMIN_CONFIG.TYPES.OTHER);
            navigate('/admin');
        } else {
            setFeedback({ show: true, message: 'Incorrect password. Access denied.' });
        }
    };

    useEffect(() => {
        fetch('/version.json')
        .then((res) => res.json())
        .then((data) => setLastUpdated(data.lastUpdated))
        .catch(() => setLastUpdated('July 02, 2026'));
    }, []);

    return (
        <div className={`side-menu ${isOpen ? 'open' : ''}`}>

        {showBugModal && 
            <BugReportModal 
                onClose={() => setShowBugModal(false)} 
            />
        }
            
        {showPasswordModal && (
            <AdminPasswordModal 
                onClose={() => setShowPasswordModal(false)} 
                onVerify={handleVerify}
            />
        )}

        {feedback.show && (
            <FeedbackModal 
                message={feedback.message} 
                onClose={() => setFeedback({ show: false, message: '' })} 
            />
        )}

        <nav className="menu-items">
            <button onClick={() => setShowPasswordModal(true)}>
                Admin Board
            </button>

            <button onClick={() => setShowBugModal(true)}>
                Report a Bug
            </button>

            <button onClick={() => window.open('https://github.com/rhit-jamesnc/TopDown-Tactix', '_blank')}>
            GitHub Repo
            </button>
        </nav>

        <footer className="menu-footer">
            <p>Created by: Noah James</p>
            <p>Last Updated: {lastUpdated}</p>
        </footer>
        </div>
    );
};