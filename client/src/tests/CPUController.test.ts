import { describe, it, expect } from 'vitest';
import { calculateCpuImpulse } from '../components/Game/CPUGameCanvas/CPUController';

describe('calculateCpuImpulse', () => {
    const mockPlayer = { position: { x: 0, y: 0 } } as Matter.Body;
    const mockBall = { position: { x: 10, y: 10 } } as Matter.Body;

    it('should cap movement force to 70% for academy difficulty', () => {
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
        expect(impulse.x).toBeLessThanOrEqual(0.0084);
    });

    it('should cap movement force to 90% for reserves difficulty', () => {
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'reserves');
        expect(impulse.x).toBeLessThanOrEqual(0.0108);
    });

    it('should allow 100% force for first-team difficulty', () => {
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'first-team');
        expect(impulse.x).toBeCloseTo(0.00848, 4); 
    });
});

describe('calculateCpuImpulse - Reaction Delay', () => {
  const mockPlayer = { position: { x: 0, y: 0 } } as Matter.Body;
  const mockBall = { position: { x: 100, y: 100 } } as Matter.Body;

  it('should return zero impulse for the first 30 frames in academy mode', () => {
    calculateCpuImpulse(null, null, 800, 600, 'academy'); 

    for (let i = 0; i < 29; i++) {
      const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
      expect(impulse).toEqual({ x: 0, y: 0 });
    }
  });

  it('should return zero impulse for the first 30 frames in reserves mode', () => {
    calculateCpuImpulse(null, null, 800, 600, 'reserves'); 

    for (let i = 0; i < 9; i++) {
      const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'reserves');
      expect(impulse).toEqual({ x: 0, y: 0 });
    }
  });

  it('should react instantly in first-team mode', () => {
    calculateCpuImpulse(null, null, 800, 600, 'first-team');
    const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'first-team');
    expect(impulse.x).not.toBe(0);
    });
});