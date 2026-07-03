import { useEffect, useState } from 'react';
import { BugReportModal } from '../BugReportModal/BugReport';
import { AdminPasswordModal } from '../AdminPasswordModal/AdminPasswordModal';
import { AdminDashboardPage } from '../../../Pages/AdminDashboardPage/AdminDashboardPage';
import type { SideMenuProps } from '../../../../../shared/types/props';
import './SideMenuModal.css';

export const SideMenu = ({ isOpen }: SideMenuProps) => {
    const [lastUpdated, setLastUpdated] = useState('Loading...');
    const [showBugModal, setShowBugModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [adminType, setAdminType] = useState<'owner' | 'other' | null>(null);

    const handleVerify = (password: string) => {
        if (password === 'OWNER_PASSWORD') {
            setAdminType('owner');
            setShowDashboard(true);
            setShowPasswordModal(false);
        } else if (password === 'OTHER_PASSWORD') {
            setAdminType('other');
            setShowDashboard(true);
            setShowPasswordModal(false);
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

        {showDashboard && (
            <AdminDashboardPage 
                isAdmin={adminType === 'owner'} 
                onClose={() => setShowDashboard(false)} 
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