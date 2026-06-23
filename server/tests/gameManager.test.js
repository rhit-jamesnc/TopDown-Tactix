import { describe, test, expect, beforeEach } from 'vitest';
import { Body } from 'matter-js';
import { GameManager } from '../GameManager';

describe('Game Manager - State Reset', () => {
  let manager;

  beforeEach(() => {
    manager = new GameManager(800, 600);
  });

  test('should cleanly reset positions and wipe velocities during pitch reset', () => {
    
    Body.setPosition(manager.ball, { x: 150, y: 200 });
    Body.setVelocity(manager.ball, { x: 5, y: -3 });
    
    manager.resetPitch();
    
    expect(manager.ball.position.x).toBe(400);
    expect(manager.ball.position.y).toBe(300);
    expect(manager.ball.velocity.x).toBe(0);
    expect(manager.ball.velocity.y).toBe(0);
    expect(manager.ball.angularVelocity).toBe(0);
  });
});

describe('Game Manager - Goal Detection', () => {
  test('should trigger goal event when ball fully crosses left goal line', () => {
    const manager = new GameManager(800, 600);
    let goalScored = false;
    let scoringTeam = '';

    manager.onGoal((team) => {
      goalScored = true;
      scoringTeam = team;
    });

    Body.setPosition(manager.ball, { x: 50, y: 300 });
    Body.setVelocity(manager.ball, { x: -10, y: 0 });

    for (let i = 0; i < 10; i++) {
      manager.update();
    }

    expect(goalScored).toBe(true);
    expect(scoringTeam).toBe('away'); 
  });
});

describe('Game Manager - Goal Area Permissions', () => {
  let manager;

  beforeEach(() => {
    manager = new GameManager(800, 600);
  });

  test('should allow the ball to pass through the left goal opening and reset pitch', () => {
    let goalScored = false;

    manager.onGoal(() => { goalScored = true; });
    
    const ballBody = manager.ball;
    
    Body.setPosition(ballBody, { x: -30, y: 300 });
    Body.setVelocity(ballBody, { x: 0, y: 0 });

    manager.update();

    expect(goalScored).toBe(true);
    expect(ballBody.position.x).toBe(400);
  });

  test('should NOT trigger goal until the ball has fully passed the left goal line', () => {
    const manager = new GameManager(800, 600);
    let goalScored = false;
    manager.onGoal(() => { goalScored = true; });
    
    Body.setVelocity(manager.ball, { x: 0, y: 0 });

    Body.setPosition(manager.ball, { x: -7.5, y: 300 });
    manager.update();

    expect(goalScored).toBe(false);
    expect(manager.ball.position.x).toBe(-7.5);
    
    Body.setPosition(manager.ball, { x: -16, y: 300 });
    manager.update();
    
    expect(goalScored).toBe(true);
    expect(manager.ball.position.x).toBe(400);
  });

  test('should block a player from passing through the left goal opening', () => {
    const playerId = 'test_player_goal_block';
    manager.addPlayer(playerId, { x: 50, y: 300 });
    const playerBody = manager.players[playerId];

    Body.setVelocity(playerBody, { x: -20, y: 0 });

    for (let i = 0; i < 20; i++) {
      manager.update(16.66);
    }

    expect(playerBody.position.x).toBeGreaterThanOrEqual(15);
  });
});