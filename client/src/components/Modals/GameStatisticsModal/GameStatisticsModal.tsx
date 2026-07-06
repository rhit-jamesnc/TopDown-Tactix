import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSymbol } from '../../../../../shared/LoadingSymbol/LoadingSymbol';
import type { GameStats } from '../../../../../shared/types/props';
import './GameStatisticsModal.css';

export const GameStatisticsModal = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isUpdating, setIsUpdating] = useState(true); 

  const fetchMockData = async (): Promise<GameStats> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      server: { ping: Math.floor(Math.random() * 40) + 10, uptime: '99.9%', status: 'Healthy' },
      cpu: { academy: 150, reserves: 430, first: 210 },
      heatmap: Array.from({ length: 7 }, () => 
        Array.from({ length: 6 }, () => Math.floor(Math.random() * 100))
      )
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const data = await fetchMockData();
        if (isMounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch initial game statistics", error);
      } finally {
        if (isMounted) setIsUpdating(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false; 
    };
  }, []);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const data = await fetchMockData();
      setStats(data);
    } catch (error) {
      console.error("Failed to update game statistics", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!stats && isUpdating) {
    return <LoadingSymbol />;
  }

  if (!stats) {
    return <div>{t('Failed to load statistics data.')}</div>;
  }

  return (
    <div className="game-statistics-container">
      <div className="stats-header">
        <span>{t('Live Game Telemetry')}</span>
        <button 
          className="update-btn" 
          onClick={handleManualUpdate} 
          disabled={isUpdating}
        >
          {isUpdating ? t('Updating...') : t('Update Now')}
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card server-health">
          <h4>{t('Server Health')}</h4>
          <div className="health-metric">{stats.server.ping} ms</div>
          <div className="stat-row">
            <span>{t('Status')}:</span>
            <span style={{ color: stats.server.status === 'Healthy' ? '#10B981' : '#f44336' }}>
              {t(stats.server.status)}
            </span>
          </div>
          <div className="stat-row">
            <span>{t('Uptime')}:</span>
            <span>{stats.server.uptime}</span>
          </div>
        </div>

        <div className="stat-card">
          <h4>{t('Active Players (vs CPU)')}</h4>
          <div className="stat-row">
            <span>{t('Academy')}:</span>
            <span>{stats.cpu.academy}</span>
          </div>
          <div className="stat-row">
            <span>{t('Reserves')}:</span>
            <span>{stats.cpu.reserves}</span>
          </div>
          <div className="stat-row">
            <span>{t('First-Team')}:</span>
            <span>{stats.cpu.first}</span>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h4>{t('Activity Heatmap (7 Days, 4-Hour Blocks)')}</h4>
        <div className="heatmap-container">
          {stats.heatmap.map((day, dayIndex) => (
            <div key={`day-${dayIndex}`} className="heatmap-row">
              {day.map((value, timeIndex) => {
                const opacity = Math.max(0.1, value / 100);
                const timeLabel = `${timeIndex * 4}:00 - ${(timeIndex + 1) * 4}:00`;
                const dayLabel = [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')][dayIndex];
                
                return (
                  <div 
                    key={`time-${timeIndex}`}
                    className="heatmap-cell"
                    style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                    title={`${dayLabel} ${timeLabel} | ${t('Activity')}: ${value}%`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};