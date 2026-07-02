import { describe, test, expect, beforeEach } from 'vitest';
import { Body } from 'matter-js';
import { GameManager } from '../gameManager';

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