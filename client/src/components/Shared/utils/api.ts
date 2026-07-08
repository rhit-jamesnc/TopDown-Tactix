import type { GameStats } from "../../../../../shared/types/props";

const API_URL = process.env.FRONTEND_URL;

export const fetchLiveStats = async (): Promise<GameStats> => {
    console.log("Debug: VITE_SERVER_URL is:", import.meta.env.VITE_SERVER_URL);
    if (!API_URL) {
        console.error("VITE_SERVER_URL is not defined in environment variables!");
        throw new Error("API Configuration Missing");
    }

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