import { useState } from 'react';
import { HomePage } from './components/HomePage.tsx';
import { OfflineGameCanvas } from './components/OfflineGameCanvas.tsx'
import { OnlineGameCanvas } from './components/OnlineGameCanvas.tsx';
import './App.css'

function App() {
  const [mode, setMode] = useState<'home' | 'offline' | 'online'>('home');

  return (
    <div className="app-viewport">
      {mode === 'home' && <HomePage onStartOffline={() => setMode('offline')} onStartOnline={() => setMode('online')} />}
      {mode === 'offline' && 
        <>
          <div className="title-overlay">TopDown Tactix</div>
          <OfflineGameCanvas />
        </>
      }
      {mode === 'online' && 
        <>
          <div className="title-overlay">TopDown Tactix</div>
          <OnlineGameCanvas />
        </>
      }
    </div>
  );
}

export default App