import { useEffect, useState } from 'react';
import { socket } from '../../Shared/utils/socket';
import './ActiveGamesModal.css';
import type { ActiveGameProps } from '../../../../../shared/types/props';

export const ActiveGamesModal = () => {
  const [games, setGames] = useState<ActiveGameProps[]>([]);

  useEffect(() => {
    socket.emit('request-active-games');

    const handleUpdate = (data: ActiveGameProps[]) => setGames(data);
    socket.on('active-games-update', handleUpdate);

    const interval = setInterval(() => {
      socket.emit('request-active-games');
    }, 2000);

    return () => {
      socket.off('active-games-update', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="active-games-container">
        {games.length === 0 ? (
            <p>No active games.</p>
        ) : (
            games.map((game, index) => (
                <div key={game.roomId} className="active-game-card">
                    <div className="game-info">
                        <span className={`status-indicator ${game.status}`}></span>
                        <div className="game-text-wrapper">
                            <h4>Game {index + 1} ({game.players.length} players)</h4>
                            <span className="game-mode-badge">
                                {(game.gameType || 'Undefined').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="game-actions">
                        <button className="details-btn">Details</button>
                        <button className="stop-btn">Force Stop</button>
                    </div>
                </div>
            ))
        )}
    </div>
  );
};