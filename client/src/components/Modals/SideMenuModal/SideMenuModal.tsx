import { useEffect, useState } from 'react';
import { BugReportModal } from '../BugReportModal/BugReportModal';
import type { SideMenuProps } from '../../../../../shared/types/props';
import './SideMenuModal.css';

export const SideMenu = ({ 
    isOpen, 
    onOpenAdmin, 
    onOpenUpdates 
}: SideMenuProps & { onOpenAdmin: () => void, onOpenUpdates: () => void }) => {
    const [lastUpdated, setLastUpdated] = useState('Loading...');
    const [showBugModal, setShowBugModal] = useState(false);

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

            <nav className="menu-items">
                <button onClick={onOpenAdmin}>
                    Admin Board
                </button>

                <button onClick={onOpenUpdates}>
                    Recent Updates
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