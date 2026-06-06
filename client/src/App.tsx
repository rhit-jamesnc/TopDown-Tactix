import { GameCanvas } from './components/GameCanvas.tsx'

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#111827',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      margin: 0,
      overflow: 'hidden'
    }}>
      <h1 style={{ marginBottom: '10px', fontSize: '24px', letterSpacing: '1px' }}>
        TOPDOWN TACTIX — FIELD PLAYGROUND
      </h1>
      <p style={{ margin: '0 0 20px 0', color: '#9CA3AF', fontSize: '14px' }}>
        Controls: Use <b>W, A, S, D</b> or <b>Arrow Keys</b> to pilot your player.
      </p>
      <GameCanvas />
    </div>
  )
}

export default App