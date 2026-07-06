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
      modes: { casual: Math.floor(Math.random() * 1000), ranked: Math.floor(Math.random() * 500), custom: Math.floor(Math.random() * 200) },
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
      
      {/* Step 3 & 4 content will go here */}
      
    </div>
  );
};