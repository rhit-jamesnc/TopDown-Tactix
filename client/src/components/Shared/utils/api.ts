import type { GameStats } from "../../../../../shared/types/props";

export const fetchLiveStats = async (): Promise<GameStats> => {
    const start = performance.now();
    const response = await fetch('/api/stats');
    const end = performance.now();
    
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    
    data.server.ping = Math.round(end - start);
    
    return data;
};