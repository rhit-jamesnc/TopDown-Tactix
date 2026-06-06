import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas.tsx'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<'home' | 'playing'>('home');

  return (
    <div className="app-viewport">
      {gameState === 'home' ? (
        <div className="home-screen">
          <h1>TopDown Tactix</h1>
          <p className="status">In Development</p>
          <button className="preview-btn" onClick={() => setGameState('playing')}>
            Preview Game
          </button>
          <a href="https://github.com/rhit-jamesnc/TopDown-Tactix" target="_blank" rel="noreferrer">
            GitHub Repository
          </a>
        </div>
      ) : (
        <>
          <div className="title-overlay">TopDown Tactix</div>
          <GameCanvas />
        </>
      )}
    </div>
  );
}

export default App