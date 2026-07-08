import type { GameStats } from "../../../../../shared/types/props";

export const fetchLiveStats = async (): Promise<GameStats> => {
    const response = await fetch('/api/stats');
    
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }
    
    return response.json();
};