import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
}

export const SideMenu = ({ isOpen }: SideMenuProps) => {
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
        <p>Last Updated: June 2026</p>
      </footer>
    </div>
  );
};