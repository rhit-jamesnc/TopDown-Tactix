import { useEffect, useState } from 'react';
import type { MatchmakingModalProps } from '../../../shared/types/props';
import './MatchmakingModal.css';

export const MatchmakingModal = ({ socket, onCancel }: MatchmakingModalProps) => {
  const [status, setStatus] = useState({ totalOnline: 0, inQueue: 0 });
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    socket.emit('request-lobby-status');
    const statusInterval = setInterval(() => socket.emit('request-lobby-status'), 2000);
    const timerInterval = setInterval(() => setSeconds((s) => s + 1), 1000);

    socket.on('lobby-status', (data) => setStatus(data));

    return () => {
      clearInterval(statusInterval);
      clearInterval(timerInterval);
      socket.off('lobby-status');
    };
  }, [socket]);

  return (
    <div className="matchmaking-overlay">
      <div className="matchmaking-content">
        <button className="close-x" onClick={onCancel}>X</button>
        <h2>Finding Opponent...</h2>
        <div className="spinner"></div>
        <p>Time searching: {seconds}s</p>
        <p>Players Online: {status.totalOnline}</p>
        <p>Waiting in Queue: {status.inQueue}</p>
      </div>
    </div>
  );
};