import { useState } from 'react';
import { HomePage } from './Pages/HomePage/HomePage.tsx';
import { OfflineGameCanvas } from './components/Game/OfflineGameCanvas/OfflineGameCanvas.tsx'
import { OnlineGameCanvas } from './components/Game/OnlineGameCanvas/OnlineGameCanvas.tsx'
import './App.css'

function App() {
  const [mode, setMode] = useState<'home' | 'offline' | 'online'>('home');

  return (
    <div className="app-viewport">
      {mode === 'home' && <HomePage onStartOffline={() => setMode('offline')} onStartOnline={() => setMode('online')} />}
      {mode === 'offline' && <OfflineGameCanvas />}
      {mode === 'online' && (
        <OnlineGameCanvas onExit={() => setMode('home')} />
      )}
    </div>
  );
}

export default App