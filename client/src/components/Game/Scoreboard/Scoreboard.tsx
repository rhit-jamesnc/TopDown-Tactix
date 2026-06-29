import type { ScoreboardProps } from '../../../../../shared/types/props';
import './Scoreboard.css';

export const Scoreboard = ({ 
  scores, 
  timeLeft, 
  isPausePending, 
  pauseRequestedBy, 
  mySocketId, 
  onPause, 
  onAcceptPause,
  isOnline = false,
  isGameOver
}: ScoreboardProps) => {
  const isMyPauseRequest = !!pauseRequestedBy && pauseRequestedBy === mySocketId;

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isPausePending && !isMyPauseRequest && onAcceptPause) {
      onAcceptPause();
    } else {
      onPause(); 
    }
  };

  const getButtonText = () => {
    if (isPausePending) {
      return isMyPauseRequest ? "Cancel" : "Accept Pause";
    }
    return "Pause";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const displayMessage = isMyPauseRequest
    ? "Waiting for opponent to accept or next goal..." 
    : "Accept to pause now, or match pauses on next goal.";

  return (
    <div className={`scoreboard-container ${isOnline ? 'online' : ''}`}>
      <div className="scoreboard-wrapper">
        <div className="scoreboard-display">
          <div className="team-score">
            <span className="team-name">Home</span>
            <span className="score-value">{scores.home}</span>
          </div>
          
          <div className="timer-box">{formatTime(timeLeft)}</div>
          
          <div className="team-score">
            <span className="team-name">Away</span>
            <span className="score-value">{scores.away}</span>
          </div>
        </div>
        
        <button className="pause-button" onClick={handleButtonClick}>
          {getButtonText()}
        </button>
      </div>
      <div className={`pause-pending-indicator ${!isPausePending ? 'hiding' : ''}`}>
        <span className="indicator-text">{displayMessage}</span>
      </div>

      {isGameOver && (
        <div className="game-over-banner">
          Game Over
        </div>
      )}
    </div>
  );
};