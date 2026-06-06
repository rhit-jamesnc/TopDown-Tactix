import { GameCanvas } from './components/GameCanvas.tsx'
import { GAME_TITLE } from '../../shared/constants'
import './App.css'

function App() {
  return (
    <div className="app-viewport">
      <div className="title-overlay">{GAME_TITLE}</div>
      <GameCanvas />
    </div>
  )
}

export default App