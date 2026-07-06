import { useEffect, useState } from 'react';
import { socket } from '../../Shared/utils/socket';
import type { ActiveGameDetailsProp, GameDetails } from '../../../../../shared/types/props'
import './ActiveGameDetailsModal.css';

export const ActiveGameDetailsModal = ({ roomId, onClose }: ActiveGameDetailsProp) => {
    const [details, setDetails] = useState<GameDetails | null>(null);
    const adminType = sessionStorage.getItem('adminType');
    const isOwner = adminType === 'owner';

    useEffect(() => {
        socket.emit('admin-request-game-details', roomId);

        const handleUpdate = (data: { roomId: string, details: GameDetails }) => {
            if (data.roomId === roomId) {
                setDetails(data.details);
            }
        };

        socket.on('admin-game-details-update', handleUpdate);
        
        const interval = setInterval(() => {
            socket.emit('admin-request-game-details', roomId);
        }, 1000);

        return () => {
            socket.off('admin-game-details-update', handleUpdate);
            clearInterval(interval);
        };
    }, [roomId]);

    const handleAction = (action: string, targetPlayer?: string) => {
        if (!isOwner) return;
        socket.emit('admin-force-action', { roomId, action, targetPlayer });
        onClose();
    };

    if (!details) {
        return (
            <div className="admin-modal-overlay">
                <div className="admin-modal-content loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="modal-header">
                    <h3>Game Details</h3>
                    <button className="close-icon" onClick={onClose}>&times;</button>
                </div>
                
                <div className="details-info">
                    <p><strong>Room ID:</strong> {roomId}</p>
                    <p><strong>Status:</strong> <span className={`status-text ${details.status}`}>{details.status.toUpperCase()}</span></p>
                    <p><strong>Time Left:</strong> {details.timeLeft !== null ? `${Math.floor(details.timeLeft)}s` : 'Local Engine'}</p>
                    <p><strong>Score:</strong> {details.score ? `Home ${details.score.home} - ${details.score.away} Away` : 'Local Engine'}</p>
                </div>
                
                <div className="player-list">
                    <h4>Players</h4>
                    {details.players.map((playerId, idx) => {
                        const team = idx === 0 ? 'Home' : 'Away';
                        const isKickable = details.status === 'online';
                        
                        return (
                            <div key={playerId || idx} className="player-row">
                                <span><strong>{team}:</strong> {playerId || 'Local/CPU'}</span>
                                {isKickable && (
                                    <button 
                                        className="kick-btn"
                                        disabled={!isOwner}
                                        onClick={() => handleAction('kick', playerId)}
                                    >
                                        Kick (Opponent Wins)
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="modal-actions">
                    <button 
                        className="draw-btn"
                        disabled={!isOwner || details.status !== 'online'}
                        onClick={() => handleAction('draw')}
                    >
                        Force Draw
                    </button>
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};