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