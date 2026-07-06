import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSymbol } from '../../../../../shared/LoadingSymbol/LoadingSymbol';
import type { GameStats } from '../../../../../shared/types/props';
import { SmoothLineChart } from './SmoothLineChart';
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
        modes: { offline: Math.floor(Math.random() * 1000), online: Math.floor(Math.random() * 500), cpu: Math.floor(Math.random() * 200) },
        activityTrend: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
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
          <h4>{t('Active Players (Modes)')}</h4>
          <div className="stat-row">
            <span>{t('1v1 Offline')}:</span>
            <span>{stats.modes.offline}</span>
          </div>
          <div className="stat-row">
            <span>{t('1v1 Online')}:</span>
            <span>{stats.modes.online}</span>
          </div>
          <div className="stat-row">
            <span>{t('vs CPU')}:</span>
            <span>{stats.modes.cpu}</span>
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

      <div className="chart-card">
        <h4>{t('Daily Activity Trend (Past 24h)')}</h4>
        <SmoothLineChart data={stats.activityTrend} />
      </div>
    </div>
  );
};