import Matter from 'matter-js';

const FORCE_MAGNITUDE = 0.012;

export const calculateCpuImpulse = (
    cpuPlayer: Matter.Body | null, 
    ball: Matter.Body | null, 
    pitchWidth: number, 
    pitchHeight: number
) => {
    if (!cpuPlayer || !ball) return { x: 0, y: 0 };

    const attackGoalX = 0;
    const attackGoalY = pitchHeight / 2;

    const dx = ball.position.x - cpuPlayer.position.x;
    const dy = ball.position.y - cpuPlayer.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        const cpuImpulse = {
            x: normalizedX * FORCE_MAGNITUDE,
            y: normalizedY * FORCE_MAGNITUDE
        };

        return cpuImpulse;
    }

    return { x: 0, y: 0 };
}