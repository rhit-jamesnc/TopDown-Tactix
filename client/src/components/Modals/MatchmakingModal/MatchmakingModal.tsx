import { useEffect, useState } from 'react';
import type { MatchmakingModalProps } from '../../../../../shared/types/props';
import './MatchmakingModal.css';

export const MatchmakingModal = ({ socket, onCancel, onMatchReady }: MatchmakingModalProps) => {
  const [status, setStatus] = useState({ totalOnline: 0, inQueue: 0 });
  const [seconds, setSeconds] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    socket.emit('request-lobby-status');
    const statusInterval = setInterval(() => socket.emit('request-lobby-status'), 2000);
    const timerInterval = setInterval(() => setSeconds((s) => s + 1), 1000);

    socket.on('lobby-status', (data) => setStatus(data));

    socket.on('match-found', () => {
      setMatchFound(true);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setTimeout(() => onMatchReady(), 0);
          }
          return prev - 1;
        });
      }, 1000);
    });
    
    let isCancelled = false;
    const matchTimer = setTimeout(() => {
      if (!isCancelled) socket.emit('find-match');
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(matchTimer);
      clearInterval(statusInterval);
      clearInterval(timerInterval);
      socket.off('lobby-status');
      socket.off('match-found');
    };
  }, [socket, onMatchReady]);

  return (
    <div className="matchmaking-overlay">
      <div className="matchmaking-content">
        {!matchFound ? (
          <>
            <button className="close-x" onClick={onCancel}>&times;</button>
            <h2>Finding Opponent...</h2>
            <div className="spinner"></div>
            <p>Time searching: {seconds}s</p>
            <p>Players Online: {status.totalOnline}</p>
            <p>Waiting in Queue: {status.inQueue}</p>
          </>
        ) : (
          <div className="match-found-view">
            <h2>Match Found!</h2>
            <p>Starting in...</p>
            <div className="countdown-number-large">{countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};