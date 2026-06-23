interface GameOverModalProps {
  winner: string;
  reason: string;
  scores: { p1: number; p2: number };
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal = ({ winner, reason, scores, onPlayAgain, onHome }: GameOverModalProps) => {
  const getDisplayName = (val: string) => {
    const map: Record<string, string> = {
      'p1': 'RED TEAM',
      'p2': 'BLUE TEAM',
      'home': 'RED TEAM',
      'away': 'BLUE TEAM'
    };
    return map[val] || val;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>GAME OVER</h2>
        <div className="final-scores">{scores.p1} - {scores.p2}</div>
        
        <p className="winner-text">
          Winner: <strong>{getDisplayName(winner)}</strong>
        </p>
        
        <p className="reason-text">{reason === 'goal' ? 'Goal limit reached' : 'Time expired'}</p>
        
        <div className="modal-actions">
          <button className="btn-playAgain" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="btn-home" onClick={onHome}>EXIT TO MENU</button>
        </div>
      </div>
    </div>
  );
};