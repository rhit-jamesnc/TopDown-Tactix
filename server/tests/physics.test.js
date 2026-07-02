import { describe, test, expect, beforeEach } from 'vitest';
import { Body } from 'matter-js';
import { GamePhysicsEngine } from '../physicsEngine.js';  

describe('Game Physics Engine - Boundary Collisions', () => {
  let gamePhysics;

  beforeEach(() => {
    gamePhysics = new GamePhysicsEngine(800, 600);
  });

  test('should initialize a physics world with a ball and boundary walls', () => {
    expect(gamePhysics.engine).toBeDefined();
    expect(gamePhysics.ball).toBeDefined();
    expect(gamePhysics.walls.length).toBe(8); 
  });

  test('should detect collision and bounce the ball away from the right boundary wall', () => {
    gamePhysics = new GamePhysicsEngine(800, 600);
    const ballBody = gamePhysics.ball;

    Body.setPosition(ballBody, { x: 700, y: 300 });
    Body.setVelocity(ballBody, { x: 5, y: 0 });

    for (let i = 0; i < 60; i++) {
      gamePhysics.update(1000 / 60);
    }

    expect(ballBody.velocity.x).toBeLessThanOrEqual(0);
    expect(ballBody.position.x).toBeLessThan(800);
  });
});

describe('Game Physics Engine - High-Velocity Edge Cases', () => {
  let physics;

  beforeEach(() => {
    physics = new GamePhysicsEngine(800, 600);
  });

  test('should accurately reflect ball velocity and invert x-vector upon bouncing off the right wall', () => {
    expect(physics.ball.position.x).toBe(400);
    expect(physics.ball.position.y).toBe(300);

    Body.setPosition(physics.ball, { x: 600, y: 300 });
    Body.setVelocity(physics.ball, { x: 15, y: 0 });

    for (let i = 0; i < 20; i++) {
      physics.update(16.66);
    }

    expect(physics.ball.velocity.x).toBeLessThanOrEqual(0);
  });
});

describe('Game Physics Engine - Player Integration & Borders', () => {
  let gamePhysics;

  beforeEach(() => {
    gamePhysics = new GamePhysicsEngine(800, 600);
  });

  test('should handle spawning a dynamic player entity inside the canvas limits', () => {
    const playerId = 'player_one';
    gamePhysics.addPlayer(playerId, { x: 200, y: 300 });

    const p = gamePhysics.players[playerId];
    expect(p).toBeDefined();
    expect(p.position.x).toBe(200);
    expect(p.position.y).toBe(300);
  });

  test('should restrict player movement past the left boundary wall on structural impact', () => {
    const playerId = 'player_left_edge';
    gamePhysics.addPlayer(playerId, { x: 50, y: 300 });
    const playerBody = gamePhysics.players[playerId];

    Body.setVelocity(playerBody, { x: -15, y: 0 });

    for (let i = 0; i < 20; i++) {
      gamePhysics.update(16.66);
    }

    expect(playerBody.position.x).toBeGreaterThanOrEqual(15);
    expect(playerBody.velocity.x).toBe(0);
  });
});

describe('Game Physics Engine - Kinetic Interactivity', () => {
  let physics;

  beforeEach(() => {
    physics = new GamePhysicsEngine(800, 600);
  });

  test('should transfer velocity from player to ball during a tackle collision', () => {
    const playerId = 'striker';

    physics.addPlayer(playerId, { x: 350, y: 300 });
    const playerBody = physics.players[playerId];

    expect(physics.ball.position.x).toBe(400);
    expect(physics.ball.velocity.x).toBe(0);

    Body.setVelocity(playerBody, { x: 10, y: 0 });

    for (let i = 0; i < 15; i++) {
      physics.update(16.66);
    }

    expect(physics.ball.velocity.x).toBeGreaterThan(0);
  });
});

describe('physicsEngine - Goal Area Logic', () => {
  let physics;
  beforeEach(() => {
    physics = new GamePhysicsEngine(800, 600);
  });

  test('should reset ball and player positions after a goal', async () => {
    physics.addPlayer('home', { x: 100, y: 300 });
    physics.addPlayer('away', { x: 105, y: 300 });

    physics.resetPositions();

    expect(physics.ball.position.x).toBeCloseTo(400, 0);
    expect(physics.ball.position.y).toBeCloseTo(300, 0);
  });

  test('should trigger goal behavior when ball crosses goal line', () => {
    let goalTriggered = false;
    physics.onGoal(() => { goalTriggered = true; });
    Body.setPosition(physics.ball, { x: -30, y: 300 });
    
    physics._test_checkGoal();
    
    expect(goalTriggered).toBe(true);
  });

  test('should NOT trigger goal until the ball has fully passed the left goal line', () => {
    let goalScored = false;
    physics.onGoal(() => { goalScored = true; });
    
    Body.setVelocity(physics.ball, { x: 0, y: 0 });

    Body.setPosition(physics.ball, { x: -7.5, y: 300 });
    physics.update();

    physics._test_checkGoal();
    expect(goalScored).toBe(false);
    expect(physics.ball.position.x).toBe(-7.5);
    
    Body.setPosition(physics.ball, { x: -16, y: 300 });
    physics.update();
    
    physics._test_checkGoal();
    expect(goalScored).toBe(true);
  });

  test('should block player from moving through goal opening', () => {
    const playerId = 'blocker_test';
    physics.addPlayer(playerId, { x: 50, y: 300 });
    const player = physics.players[playerId];
    
    Body.setVelocity(player, { x: -20, y: 0 });
    
    for (let i = 0; i < 10; i++) {
      physics.update();
    }
    
    expect(player.position.x).toBeGreaterThanOrEqual(15);
  });
});

describe('Game Physics Engine - Velocity Clamping', () => {
  let physics;

  beforeEach(() => {
    physics = new GamePhysicsEngine(800, 600);
  });

  test('should safely handle _clampVelocities when ball is null', () => {
    physics.ball = null;
    expect(() => physics._clampVelocities()).not.toThrow();
  });

  test('should clamp ball velocity to 25', () => {
    Body.setVelocity(physics.ball, { x: 50, y: 0 });
    physics.update();
    const speed = Math.hypot(physics.ball.velocity.x, physics.ball.velocity.y);
    expect(speed).toBeLessThanOrEqual(25);
  });

  test('should clamp player velocity to 12', () => {
    physics.addPlayer('p1', { x: 400, y: 300 });
    const p = physics.players['p1'];
    Body.setVelocity(p, { x: 20, y: 0 });
    physics.update();
    const speed = Math.hypot(p.velocity.x, p.velocity.y);
    expect(speed).toBeLessThanOrEqual(12);
  });
});

describe('Game Physics Engine - Move Validation', () => {
  test('should return true for valid moves and false for excessive force', () => {
    expect(GamePhysicsEngine.isValidMove({ x: 0.2, y: 0.2 })).toBe(true);
    expect(GamePhysicsEngine.isValidMove({ x: 0.6, y: 0 })).toBe(false);
  });
});

describe('Game Physics Engine - State Retrieval', () => {
  test('should return correct state structure', () => {
    const physics = new GamePhysicsEngine(800, 600);
    physics.addPlayer('p1', { x: 100, y: 100 });
    
    const state = physics.getState();
    expect(state).toHaveProperty('ball');
    expect(state).toHaveProperty('players.p1');
    expect(state.players.p1.position).toEqual({ x: 100, y: 100 });
  });
});

describe('_test_checkGoal functionality', () => {
  let physics;

  beforeEach(() => {
    physics = new GamePhysicsEngine(800, 600);
  });

  test('should trigger goal callback when ball is in goal zone', () => {
    let goalTriggered = false;
    physics.onGoal(() => { goalTriggered = true; });
    
    Body.setPosition(physics.ball, { x: -30, y: 300 });
    physics._test_checkGoal();
    
    expect(goalTriggered).toBe(true);
  });

  test('should NOT trigger goal when ball is inside the pitch', () => {
    let goalTriggered = false;
    physics.onGoal(() => { goalTriggered = true; });
    
    Body.setPosition(physics.ball, { x: 400, y: 300 });
    physics._test_checkGoal();
    
    expect(goalTriggered).toBe(false);
  });

  test('should do nothing if not in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    let goalTriggered = false;
    physics.onGoal(() => { goalTriggered = true; });
    
    Body.setPosition(physics.ball, { x: -30, y: 300 });
    physics._test_checkGoal();
    
    expect(goalTriggered).toBe(false);
    
    process.env.NODE_ENV = originalEnv; // Reset env
  });

  test('should do nothing if no callback is registered', () => {
    physics.goalCallback = null;
    Body.setPosition(physics.ball, { x: -30, y: 300 });
    
    expect(() => physics._test_checkGoal()).not.toThrow();
  });
});