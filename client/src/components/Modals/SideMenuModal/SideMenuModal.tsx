import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BugReportModal } from '../BugReportModal/BugReport';
import { AdminPasswordModal } from '../AdminPasswordModal/AdminPasswordModal';
import type { SideMenuProps } from '../../../../../shared/types/props';
import './SideMenuModal.css';

export const SideMenu = ({ isOpen }: SideMenuProps) => {
    const [lastUpdated, setLastUpdated] = useState('Loading...');
    const [showBugModal, setShowBugModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const navigate = useNavigate();

    const handleVerify = (password: string) => {
        if (password === 'OWNER_PASSWORD') {
            localStorage.setItem('adminType', 'owner');
            navigate('/admin');
        } else if (password === 'OTHER_PASSWORD') {
            localStorage.setItem('adminType', 'other');
            navigate('/admin');
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