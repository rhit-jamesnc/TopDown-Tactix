import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { socket } from '../../Shared/utils/socket';
import { ActiveGameDetailsModal } from '../ActiveGameDetailsModal/ActiveGameDetailsModal';
import type { ActiveGameProps, ActiveGamesModalProps } from '../../../../../shared/types/props';
import './ActiveGamesModal.css';

export const ActiveGamesModal = ({ isAdmin }: ActiveGamesModalProps) => {
  const [games, setGames] = useState<ActiveGameProps[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { t } = useTranslation();

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
    <>
        <div className="active-games-container">
            {games.length === 0 ? (
                <p>{t('No active games.')}</p>
            ) : (
                games.map((game, index) => (
                    <div key={game.roomId} className="active-game-card">
                        <div className="game-info">
                            <span className={`status-indicator ${game.status}`}></span>
                            <div className="game-text-wrapper">
                                <h4>{t('Game {{number}}', { number: index + 1 })} ({game.players?.length || 0} {t('players')})</h4>
                                <div className="badge-wrapper">
                                    <span className="game-mode-badge">
                                        {(game.gameType || 'Undefined').toUpperCase()}
                                    </span>
                                    {game.difficulty && (
                                        <span className={`difficulty-badge ${game.difficulty.toLowerCase()}`}>
                                            {game.difficulty.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="game-actions">
                            <button 
                                className="details-btn"
                                onClick={() => setSelectedRoomId(game.roomId)}
                            >
                                {t('Details')}
                            </button>
                            <button 
                                className={`stop-btn ${!isAdmin ? 'disabled' : ''}`}
                                disabled={!isAdmin}
                                onClick={() => socket.emit('admin-force-action', { 
                                    roomId: game.roomId, 
                                    action: 'stop' 
                                })}
                            >
                                {t('Force Stop')}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
        {selectedRoomId && (
            <ActiveGameDetailsModal 
                roomId={selectedRoomId} 
                onClose={() => setSelectedRoomId(null)} 
            />
        )}
    </>
  );
};