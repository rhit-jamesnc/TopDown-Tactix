import { GameCanvas } from './components/GameCanvas.tsx'
import './App.css'

function App() {
  return (
    <div className="app-viewport">
      <div className="title-overlay">TopDown Tactix</div>
      <GameCanvas />
    </div>
  )
}

export default App