import Matter from 'matter-js';

const FORCE_MAGNITUDE = 0.015;
const SWEET_SPOT_DISTANCE = 50;
const PADDING = 50;

const SPEED_MULTIPLIER = {
    'academy': 0.6,
    'reserves': 1,
    'first-team': 1.2
};

const delayFrames = { 
    'academy': 30, 
    'reserves': 15, 
    'first-team': 0 
};

let frameCounter = 0;
let lastImpulse = { x: 0, y: 0 };

export const resetCpuState = () => {
    frameCounter = 0;
    lastImpulse = { x: 0, y: 0 };
};

export const calculateCpuImpulse = (
    cpuPlayer: Matter.Body | null, 
    ball: Matter.Body | null, 
    pitchWidth: number, 
    pitchHeight: number,
    difficulty: 'academy' | 'reserves' | 'first-team' = 'reserves'
) => {
    if (!cpuPlayer || !ball) {
        frameCounter = 0;
        return { x: 0, y: 0 };
    }

    if (frameCounter < delayFrames[difficulty]) {
        frameCounter++;
        return lastImpulse;
    }

    frameCounter = 0;

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

    const moveForce = FORCE_MAGNITUDE * SPEED_MULTIPLIER[difficulty]

    if (distToTarget < 50) {
        lastImpulse = {
            x: (cpuToBallX / distToBall) * moveForce,
            y: (cpuToBallY / distToBall) * moveForce
        };
        return lastImpulse;
    } else {
        lastImpulse = {
            x: (cpuToTargetX / distToTarget) * moveForce,
            y: (cpuToTargetY / distToTarget) * moveForce
        };
        return lastImpulse;
    }
}