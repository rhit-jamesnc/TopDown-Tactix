import { useEffect, useState } from 'react';
import './SideMenu.css';
import type { SideMenuProps } from '../../../../../shared/types/props';

export const SideMenu = ({ isOpen }: SideMenuProps) => {
    const [lastUpdated, setLastUpdated] = useState('Loading...');

    useEffect(() => {
        fetch('/version.json')
        .then((res) => res.json())
        .then((data) => setLastUpdated(data.lastUpdated))
        .catch(() => setLastUpdated('July 02, 2026')); // Fallback
    }, []);

    return (
        <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <nav className="menu-items">
            <button>Admin Board</button>
            <button>Report a Bug</button>
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