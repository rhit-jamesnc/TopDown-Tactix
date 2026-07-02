import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Body } from 'matter-js';
import { GameManager } from '../gameManager';
import { checkGoalWin, checkTimeExpiry } from '../../shared/gameEndConditions';

vi.mock('matter-js', () => {
  const MockBody = {
    applyForce: vi.fn(),
    setPosition: vi.fn(),
    setVelocity: vi.fn()
  };
  return {
    default: { Body: MockBody },
    Body: MockBody
  };
});

vi.mock('../physicsEngine.js', () => {
  return {
    GamePhysicsEngine: class {
      constructor() {
        this.addPlayer = vi.fn();
        this.players = {};
        this.update = vi.fn();
        this.width = 800;
        this.ball = { 
          position: { x: 400, y: 300 },
          velocity: { x: 0, y: 0 },
          angularVelocity: 0 
        };
        
        this.resetPositions = vi.fn(() => {
          this.ball.position = { x: 400, y: 300 };
          this.ball.velocity = { x: 0, y: 0 };
          this.ball.angularVelocity = 0;
        });
        
        this.getState = vi.fn().mockReturnValue({ ball: { x: 400, y: 300 }, players: {} });
      }
    }
  };
});

vi.mock('../../shared/gameEndConditions.js', () => ({
  checkGoalWin: vi.fn(),
  checkTimeExpiry: vi.fn()
}));

describe('Game Manager - Core Methods & Getters', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new GameManager(800, 600);
  });

  test('should pass player addition to physics engine', () => {
    manager.addPlayer('player1', { x: 50, y: 50 });
    expect(manager.physics.addPlayer).toHaveBeenCalledWith('player1', { x: 50, y: 50 });
  });

  test('should return players from physics engine', () => {
    manager.physics.players = { p1: { id: 'p1' } };
    expect(manager.players).toEqual({ p1: { id: 'p1' } });
  });

  test('should return ball from physics engine', () => {
    expect(manager.ball.position.x).toBe(400);
  });

  test('should return state from physics engine', () => {
    expect(manager.getState()).toEqual({ ball: { x: 400, y: 300 }, players: {} });
  });
});

describe('Timers and Updates', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new GameManager(800, 600);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should manage countdown active state and clear previous timeouts', () => {
    manager.triggerCountdown(3000);
    expect(manager.isCountdownActive).toBe(true);
    expect(manager.countdownTimeout).not.toBeNull();

    manager.triggerCountdown(1000);
    
    vi.advanceTimersByTime(1000);
    expect(manager.isCountdownActive).toBe(false);
  });

  test('should update physics, decrement timer, and check goals', () => {
    manager.timer = 100;
    manager.update(1);
    
    expect(manager.physics.update).toHaveBeenCalled();
    expect(manager.timer).toBe(99);
  });

  test('should fallback to 1/60 for deltaTime if not provided', () => {
    manager.timer = 100;
    manager.update();
    
    expect(manager.timer).toBe(100 - (1/60));
  });

  test('getRemainingTime should return ceiling of timer and not drop below zero', () => {
    manager.timer = 45.1;
    expect(manager.getRemainingTime()).toBe(46);

    manager.timer = -5;
    expect(manager.getRemainingTime()).toBe(0);
  });
});

describe('Game Manager - State Reset', () => {
  let manager;

  beforeEach(() => {
    manager = new GameManager(800, 600);
  });

  test('should cleanly reset positions and wipe velocities during pitch reset', () => {
    manager.physics.ball.position = { x: 150, y: 200 };
    manager.physics.ball.velocity = { x: 5, y: -3 };
    
    manager.resetPitch();
    
    expect(manager.ball.position.x).toBe(400);
    expect(manager.ball.position.y).toBe(300);
    expect(manager.ball.velocity.x).toBe(0);
    expect(manager.ball.velocity.y).toBe(0);
    expect(manager.ball.angularVelocity).toBe(0);
  });
});

describe('Game Manager - Player Inputs', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new GameManager(800, 600);
  });

  test('should apply force when input is active and player exists', () => {
    manager.physics.players['home'] = { position: { x: 400, y: 300 }, velocity: { x: 0, y: 0 } };
    manager.setPlayerInput('home', { x: 0.1, y: 0 });
    manager.applyInputs();
    
    expect(Body.applyForce).toHaveBeenCalled();
  });

  test('should NOT apply force if input is exactly zero', () => {
    manager.physics.players['home'] = { position: { x: 400, y: 300 } };
    manager.setPlayerInput('home', { x: 0, y: 0 });
    manager.applyInputs();
    
    expect(Body.applyForce).not.toHaveBeenCalled();
  });

  test('should NOT apply force if player does not exist in physics engine', () => {
    manager.setPlayerInput('ghost_player', { x: 1, y: 1 });
    manager.applyInputs();
    
    expect(Body.applyForce).not.toHaveBeenCalled();
  });
});

describe('Game Manager - Goal Logic', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new GameManager(800, 600);
  });

  test('should early return from _checkGoals if prerequisites are missing', () => {
    manager.physics.ball = null;
    manager._checkGoals();
    
    manager.physics.ball = { position: { x: -50 } };
    manager.goalCallback = null;
    manager._checkGoals();
    expect(manager.scores.away).toBe(0);
    
    manager.onGoal(vi.fn());
    manager.isGoalTriggered = true;
    manager._checkGoals();
    expect(manager.scores.away).toBe(0);
  });

  test('should trigger away goal when ball crosses left goal line', () => {
    let goalSide = null;
    manager.onGoal((side) => { goalSide = side; });
    
    manager.physics.ball.position.x = -20;
    manager._checkGoals();

    expect(goalSide).toBe('away');
    expect(manager.scores.away).toBe(1);
  });

  test('should trigger home goal when ball crosses right goal line', () => {
    let goalSide = null;
    manager.onGoal((side) => { goalSide = side; });
    
    manager.physics.ball.position.x = 820; 
    manager._checkGoals();

    expect(goalSide).toBe('home');
    expect(manager.scores.home).toBe(1);
  });

  test('goal should not trigger goal if ball is in play', () => {
    manager.onGoal(vi.fn());
    manager.physics.ball = { position: { x: 400 } };
    manager._checkGoals();
    expect(manager.isGoalTriggered).toBe(false);
  });
});

describe('Game Manager - Game Status', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new GameManager(800, 600);
  });

  test('should return win by goal limit', () => {
    checkGoalWin.mockReturnValue(true);
    manager.scores.home = 5;
    expect(manager.getGameStatus()).toEqual({ winner: 'home', reason: 'goal' });

    checkGoalWin.mockImplementation((score) => score === manager.scores.away);
    manager.scores.home = 0;
    manager.scores.away = 5;
    expect(manager.getGameStatus()).toEqual({ winner: 'away', reason: 'goal' });
  });

  test('should return win/loss/tie by time expiry', () => {
    checkGoalWin.mockReturnValue(false);
    manager.timer = 0;

    checkTimeExpiry.mockReturnValue('win');
    expect(manager.getGameStatus()).toEqual({ winner: 'home', reason: 'time' });

    checkTimeExpiry.mockReturnValue('loss');
    expect(manager.getGameStatus()).toEqual({ winner: 'away', reason: 'time' });

    checkTimeExpiry.mockReturnValue('tie');
    expect(manager.getGameStatus()).toEqual({ winner: 'tie', reason: 'time' });
  });

  test('should return ongoing if no limits are reached', () => {
    checkGoalWin.mockReturnValue(false);
    manager.timer = 100;
    expect(manager.getGameStatus()).toBe('ongoing');
  });
});