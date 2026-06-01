import { describe, test, expect, beforeEach } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Engine, World, Bodies, Body } from 'matter-js';
import { GamePhysicsEngine } from './physicsEngine.js';  

describe('Game Physics Engine - Boundary Collisions', () => {
  let gamePhysics;

  beforeEach(() => {
    gamePhysics = new GamePhysicsEngine(800, 600);
  });

  test('should initialize a physics world with a ball and boundary walls', () => {
    expect(gamePhysics.engine).toBeDefined();
    expect(gamePhysics.ball).toBeDefined();
    expect(gamePhysics.walls.length).toBe(4); 
  });

  test('should detect collision and bounce the ball away from the right boundary wall', () => {
    const ballBody = gamePhysics.ball;

    Body.setPosition(ballBody, { x: 780, y: 300 });
    Body.setVelocity(ballBody, { x: 10, y: 0 });

    for (let i = 0; i < 60; i++) {
      gamePhysics.update(1000 / 60);
    }

    expect(ballBody.velocity.x).toBeLessThan(0);
    expect(ballBody.position.x).toBeLessThan(800);
  });
});

describe('Game Physics Engine - Phase 1 High-Velocity Edge Cases', () => {
  test('should accurately reflect ball velocity and invert x-vector upon bouncing off the right wall', () => {
    const physics = new GamePhysicsEngine(800, 600);
    
    expect(physics.ball.position.x).toBe(400);
    expect(physics.ball.position.y).toBe(300);

    Body.setVelocity(physics.ball, { x: 25, y: 0 });

    for (let i = 0; i < 20; i++) {
      physics.update(16.66);
    }

    expect(physics.ball.position.x).toBeLessThan(800);
    expect(physics.ball.velocity.x).toBeLessThan(0);
  });
});