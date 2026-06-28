
import Matter from 'matter-js';
import { GamePhysicsEngine } from './physicsEngine.js';
import { checkGoalWin, checkTimeExpiry } from '../shared/gameEndConditions.js';

export class GameManager {
    constructor(width, height) {
        this.physics = new GamePhysicsEngine(width, height);
        this.scores = { home: 0, away: 0 };
        this.timer = 180;
        this.winLimit = 5;
        this.goalCallback = null;
        this.isGoalTriggered = false;
        this.isPaused = false;
        this.isPausePending = false;
        this.isCountdownActive = true;
        this.countdownTimeout = null;
        this.playerInputs = {};
    }

    addPlayer(id, pos) { 
        this.physics.addPlayer(id, pos); 
    }

    setPlayerInput(id, move) {
        this.playerInputs[id] = move;
    }

    applyInputs() {
        Object.entries(this.playerInputs).forEach(([id, move]) => {
            if (move.x !== 0 || move.y !== 0) {
                const player = this.physics.players[id];
                if (player) {
                    Matter.Body.applyForce(player, player.position, move);
                }
            }
        });
    }

    triggerCountdown(durationMs) {
        this.isCountdownActive = true;
        if (this.countdownTimeout) clearTimeout(this.countdownTimeout);
        this.countdownTimeout = setTimeout(() => {
            this.isCountdownActive = false;
        }, durationMs);
    }

    get ball() { 
        return this.physics.ball; 
    }

    get players() { 
        return this.physics.players; 
    }

    resetPitch() { 
        this.physics.resetPositions(); 
        this.isGoalTriggered = false;
    }

    onGoal(callback) { 
        this.goalCallback = callback; 
    }

    update(deltaTime) {
        this.physics.update();
        this.timer -= (deltaTime || 1/60);
        this._checkGoals();
    }

    _checkGoals() {
        if (!this.ball || !this.goalCallback || this.isGoalTriggered) return;

        const radius = 15;
        const x = this.ball.position.x;

        if (x + radius - 1 < 0) {
            this.isGoalTriggered = true;
            this.scores.away += 1;
            if (this.goalCallback) this.goalCallback('away', this.scores);
            this.resetPitch();
        } else if (x - radius + 1 > this.physics.width) {
            this.isGoalTriggered = true;
            this.scores.home += 1;
            if (this.goalCallback) this.goalCallback('home', this.scores);
            this.resetPitch();
        }
    }

    getRemainingTime() {
        return Math.max(0, Math.ceil(this.timer));
    }

    getGameStatus() {
        if (checkGoalWin(this.scores.home, this.winLimit)) return { winner: 'home', reason: 'goal' };
        if (checkGoalWin(this.scores.away, this.winLimit)) return { winner: 'away', reason: 'goal' };
        
        if (this.timer <= 0) {
            const result = checkTimeExpiry(this.scores.home, this.scores.away);

            if (result === 'win') return { winner: 'home', reason: 'time' };
            if (result === 'loss') return { winner: 'away', reason: 'time' };
            return { winner: result, reason: 'time' };
        }
        
        return 'ongoing';
    }

    getState() {
        return this.physics.getState();
    }
}