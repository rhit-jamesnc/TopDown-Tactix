import './HomePage.css';

export const HomePage = ({ onStartGame }: { onStartGame: () => void }) => {
  return (
    <div className="home-screen">
        <div className="status-banner">IN DEVELOPMENT</div>
        <h1>TopDown Tactix</h1>
        <p className="creator">Created By Noah James</p>
        <button className="preview-btn" onClick={onStartGame}>
            Preview Game
        </button>
        <a href="https://github.com/rhit-jamesnc/TopDown-Tactix" target="_blank" rel="noreferrer">
            GitHub Repository
        </a>
    </div>
  );
};