import Matter from 'matter-js';

const FORCE_MAGNITUDE = 0.012;
const SWEET_SPOT_DISTANCE = 50;
const PADDING = 50;

export const calculateCpuImpulse = (
    cpuPlayer: Matter.Body | null, 
    ball: Matter.Body | null, 
    pitchWidth: number, 
    pitchHeight: number
) => {
    if (!cpuPlayer || !ball) return { x: 0, y: 0 };

    const attackGoal = { x: 0, y: pitchHeight / 2 };

    const goalToBallX = ball.position.x - attackGoal.x;
    const goalToBallY = ball.position.y - attackGoal.y;
    const goalToBallDistance = Math.sqrt(goalToBallX * goalToBallX + goalToBallY * goalToBallY);

    const dirX = goalToBallX / goalToBallDistance;
    const dirY = goalToBallY / goalToBallDistance;

    let targetX = ball.position.x + (dirX * SWEET_SPOT_DISTANCE);
    let targetY = ball.position.y + (dirY * SWEET_SPOT_DISTANCE);

    const isBallInCorner = ball.position.x < 100 || ball.position.x > pitchWidth - 100 || 
                           ball.position.y < 100 || ball.position.y > pitchHeight - 100;
    
    const dynamicPadding = isBallInCorner ? PADDING + 30 : PADDING;

    targetX = Math.max(dynamicPadding, Math.min(pitchWidth - PADDING, targetX));
    targetY = Math.max(dynamicPadding, Math.min(pitchHeight - PADDING, targetY));

    const cpuToTargetX = targetX - cpuPlayer.position.x;
    const cpuToTargetY = targetY - cpuPlayer.position.y;
    const distToTarget = Math.sqrt(cpuToTargetX * cpuToTargetX + cpuToTargetY * cpuToTargetY);

    const cpuToBallX = ball.position.x - cpuPlayer.position.x;
    const cpuToBallY = ball.position.y - cpuPlayer.position.y;
    const distToBall = Math.sqrt(cpuToBallX * cpuToBallX + cpuToBallY * cpuToBallY);

    const moveForce = distToTarget < 100 ? FORCE_MAGNITUDE * 0.5 : FORCE_MAGNITUDE;

    if (distToTarget < 50) {
        return {
            x: (cpuToBallX / distToBall) * FORCE_MAGNITUDE,
            y: (cpuToBallY / distToBall) * FORCE_MAGNITUDE
        };
    }

    if (distToTarget > 10) {
        return {
            x: (cpuToTargetX / distToTarget) * moveForce,
            y: (cpuToTargetY / distToTarget) * moveForce
        };
    }

    return { x: 0, y: 0 };
}