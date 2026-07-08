import type { GameStats } from "../../../../../shared/types/props";

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const fetchLiveStats = async (): Promise<GameStats> => {
    const start = performance.now();
    const response = await fetch(`${API_URL}/api/stats`);
    const end = performance.now();
    
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    data.server.ping = Math.round(end - start);
    
    return data;
};