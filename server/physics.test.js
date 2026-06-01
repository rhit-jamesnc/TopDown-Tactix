import { describe, test, expect, beforeEach } from 'vitest';
import { Engine, Body } from 'matter-js';
import { GamePhysicsEngine } from './physicsEngine.js';  

describe('Game Physics Engine - State Reset', () => {
  test('should cleanly reset positions and wipe velocities during pitch reset', () => {
    const engine = new GamePhysicsEngine(800, 600);
    
    Body.setPosition(engine.ball, { x: 150, y: 200 });
    Body.setVelocity(engine.ball, { x: 5, y: -3 });
    
    engine.resetPitch();
    
    expect(engine.ball.position.x).toBe(400);
    expect(engine.ball.position.y).toBe(300);
    expect(engine.ball.velocity.x).toBe(0);
    expect(engine.ball.velocity.y).toBe(0);
    expect(engine.ball.angularVelocity).toBe(0);
  });
});

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

describe('Game Physics Engine - High-Velocity Edge Cases', () => {
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
    gamePhysics.addPlayer(playerId, { x: 20, y: 300 });
    const playerBody = gamePhysics.players[playerId];

    Body.setVelocity(playerBody, { x: -15, y: 0 });

    for (let i = 0; i < 20; i++) {
      gamePhysics.update(16.66);
    }

    expect(playerBody.position.x).toBeGreaterThan(0);
    expect(playerBody.velocity.x).toBe(0);
  });
});

describe('Game Physics Engine - Kinetic Interactivity', () => {
  test('should transfer velocity from player to ball during a tackle collision', () => {
    const physics = new GamePhysicsEngine(800, 600);
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

describe('Game Physics Engine - Kicking Mechanics', () => {
    test('should apply impulse vector to ball when player executes a kick', () => {
        const engine = new GamePhysicsEngine(800, 600);
        
        engine.addPlayer('player1', 350, 300); 
        
        engine.kickBall('player1', { x: 0.05, y: 0 });
        
        Engine.update(engine.engine, 16.66);
        
        expect(engine.ball.velocity.x).toBeGreaterThan(0);
    });
});

describe('Game Physics Engine - Goal Detection', () => {
  test('should trigger goal event and not bounce when ball hits left goal sensor', () => {
    const engine = new GamePhysicsEngine(800, 600);
    let goalScored = false;
    let scoringTeam = '';

    engine.onGoal((team) => {
      goalScored = true;
      scoringTeam = team;
    });

    Body.setPosition(engine.ball, { x: 10, y: 300 });
    Body.setVelocity(engine.ball, { x: -10, y: 0 });

    for (let i = 0; i < 10; i++) {
      Engine.update(engine.engine, 16.66);
    }

    expect(goalScored).toBe(true);
    expect(scoringTeam).toBe('away'); 
  });
});