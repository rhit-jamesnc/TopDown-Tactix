import type { GameOverModalProps } from "../../../shared/types/game"

export const GameOverModal = ({ winner, reason, scores, onPlayAgain, onHome }: GameOverModalProps) => {
  const getDisplayName = (val: string) => {
    const map: Record<string, string> = {
      'home': 'RED TEAM',
      'away': 'BLUE TEAM',
      'win': 'RED TEAM',
      'loss': 'BLUE TEAM',
      'draw': 'DRAW'
    };
    return map[val.toLowerCase()] || val.toUpperCase();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>GAME OVER</h2>
        <div className="final-scores">{scores.home} - {scores.away}</div>
        
        <p className="winner-text">
          Winner: <strong>{getDisplayName(winner)}</strong>
        </p>
        
        <p className="reason-text">{reason === 'goal' ? 'Goal limit reached' : 'Full Time'}</p>
        
        <div className="modal-actions">
          <button className="btn-playAgain" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="btn-home" onClick={onHome}>EXIT TO MENU</button>
        </div>
      </div>
    </div>
  );
};