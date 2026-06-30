import { useState } from 'react';
import { HomePage } from './Pages/HomePage/HomePage.tsx';
import { OfflineGameCanvas } from './components/Game/OfflineGameCanvas/OfflineGameCanvas.tsx'
import { OnlineGameCanvas } from './components/Game/OnlineGameCanvas/OnlineGameCanvas.tsx'
import { CPUGameCanvas } from './components/Game/CPUGameCanvas/CPUGameCanvas.tsx'
import './App.css'

function App() {
  const [mode, setMode] = useState<'home' | 'offline' | 'online' | 'CPU'>('home');

  return (
    <div className="app-viewport">
      {mode === 'home' && 
        <HomePage 
          onStartOffline={() => setMode('offline')} 
          onStartOnline={() => setMode('online')} 
          onStartCpu={() => setMode('CPU')}
      />}

      {mode === 'offline' && <OfflineGameCanvas />}
      {mode === 'online' && (
        <OnlineGameCanvas onExit={() => setMode('home')} />
      )}
      {mode === 'CPU' && <CPUGameCanvas />}
    </div>
  );
}

export default App