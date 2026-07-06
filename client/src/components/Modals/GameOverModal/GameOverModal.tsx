import { useTranslation } from 'react-i18next';
import type { GameOverModalProps } from "../../../../../shared/types/props"

export const GameOverModal = ({ winner, reason, scores, myTeam, onPlayAgain, onHome }: GameOverModalProps) => {
  const { t } = useTranslation();

  const getDisplayName = (val: string) => {
    const lowerWinner = val.toLowerCase();

    if (myTeam) {
        if (lowerWinner === 'draw') return t('DRAW');
        return lowerWinner === myTeam ? t('YOU WIN') : t('OPPONENT WINS');
    }

    const map: Record<string, string> = {
        'home': t('Winner: RED TEAM'),
        'away': t('Winner: BLUE TEAM'),
        'win': t('Winner: RED TEAM'),
        'loss': t('Winner: BLUE TEAM'),
        'draw': t('Result: DRAW')
    };
    return map[lowerWinner] || val.toUpperCase();
};

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{t('GAME OVER')}</h2>
        <div className="final-scores">{scores.home} - {scores.away}</div>
        
        <p className="winner-text"><strong>{getDisplayName(winner)}</strong></p>
        
        <p className="reason-text">
          {reason === 'goal' ? t('Goal limit reached') : 
           reason === 'forfeit' ? t('Opponent forfeited') : 
           reason === 'Full Time' ? t('Full Time') : t(reason)}
        </p>
        
        <div className="modal-actions">
          <button className="btn-playAgain" onClick={onPlayAgain}>{t('PLAY AGAIN')}</button>
          <button className="btn-home" onClick={onHome}>{t('EXIT TO MENU')}</button>
        </div>
      </div>
    </div>
  );
};