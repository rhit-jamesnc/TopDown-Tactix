import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas.tsx'
import { HomePage } from './components/HomePage.tsx';
import './App.css'

function App() {
  const [gameState, setGameState] = useState<'home' | 'playing'>('home');

  return (
    <div className="app-viewport">
      {gameState === 'home' ? (
        <HomePage onStartGame={() => setGameState('playing')} />
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