import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { socket } from '../../Shared/utils/socket';
import type { ActiveGameDetailsProp, GameDetails } from '../../../../../shared/types/props'
import './ActiveGameDetailsModal.css';
import { ADMIN_CONFIG } from '../../../../../shared/config/adminConfig';

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ActiveGameDetailsModal = ({ roomId, onClose }: ActiveGameDetailsProp) => {
    const [details, setDetails] = useState<GameDetails | null>(null);
    const adminType = sessionStorage.getItem('adminType');
    const isOwner = adminType === ADMIN_CONFIG.TYPES.OWNER;
    const { t } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
                <div className="admin-modal-content loading">{t('Loading...')}</div>
            </div>
        );
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="modal-header">
                    <h3>{t('Game Details')}</h3>
                    <button className="close-icon" onClick={onClose}>&times;</button>
                </div>
                
                <div className="details-info">
                    <p>
                        <strong>{t('Room ID:')}</strong> {roomId}
                    </p>
                    <p>
                        <strong>{t('Status: ')}</strong> 
                        <span className={`status-text ${details.status}`}>
                            {t(details.status.toUpperCase())}
                        </span>
                    </p>
                    <p>
                        <strong>{t('Time Left:')}</strong> 
                        {details.timeLeft !== null ? formatTime(details.timeLeft) : ' Local Engine'}
                    </p>
                    <p>
                        <strong>{t('Score: ')}</strong> 
                        {details.score ? `${t('Home')} ${details.score.home} - ${details.score.away} ${t('Away')}` : t('Local Engine')}
                    </p>
                </div>
                
                <div className="player-list">
                    <h4>{t('Players')}</h4>
                    {details.players.map((playerId, idx) => {
                        const team = idx === 0 ? t('Home') : t('Away');
                        const isKickable = details.status === 'online';
                        
                        return (
                            <div key={playerId || idx} className="player-row">
                                <span>
                                    <strong>{team}: </strong> 
                                    {playerId || t('Local/CPU')}
                                </span>
                                {isKickable && (
                                    <button 
                                        className="kick-btn"
                                        disabled={!isOwner}
                                        onClick={() => handleAction('kick', playerId)}
                                    >
                                        {t('Kick (Opponent Wins)')}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="modal-actions">
                    <button 
                        className="draw-btn"
                        disabled={!isOwner}
                        onClick={() => handleAction('draw')}
                    >
                        {t('Force Draw')}
                    </button>
                    <button className="close-btn" onClick={onClose}>{t('Close')}</button>
                </div>
            </div>
        </div>
    );
};