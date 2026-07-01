import type { GameOverModalProps } from "../../../../../shared/types/props"

export const GameOverModal = ({ winner, reason, scores, myTeam, onPlayAgain, onHome }: GameOverModalProps) => {
  const getDisplayName = (val: string) => {
    const lowerWinner = val.toLowerCase();

    if (myTeam) {
      if (lowerWinner === 'draw') return 'DRAW';
      return lowerWinner === myTeam ? 'YOU WIN' : 'OPPONENT WINS';
    }

    const map: Record<string, string> = {
      'home': 'Winner: RED TEAM',
      'away': 'Winner: BLUE TEAM',
      'win': 'Winner: RED TEAM',
      'loss': 'Winner: BLUE TEAM',
      'draw': 'Result: DRAW'
    };
    return map[lowerWinner] || val.toUpperCase();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>GAME OVER</h2>
        <div className="final-scores">{scores.home} - {scores.away}</div>
        
        <p className="winner-text"><strong>{getDisplayName(winner)}</strong></p>
        
        <p className="reason-text">
          {reason === 'goal' ? 'Goal limit reached' : 
           reason === 'forfeit' ? 'Opponent forfeited' : 'Full Time'}
        </p>
        
        <div className="modal-actions">
          <button className="btn-playAgain" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="btn-home" onClick={onHome}>EXIT TO MENU</button>
        </div>
      </div>
    </div>
  );
};