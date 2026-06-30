import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCpuImpulse, resetCpuState } from '../components/Game/CPUGameCanvas/CPUController';

describe('calculateCpuImpulse', () => {
    const mockPlayer = { position: { x: 0, y: 0 } } as Matter.Body;
    const mockBall = { position: { x: 10, y: 10 } } as Matter.Body;

    beforeEach(() => resetCpuState());

    it('should cap movement force to 60% for academy difficulty', () => {
        calculateCpuImpulse(null, null, 800, 600, 'academy');
        for (let i = 0; i < 30; i++) {
            calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
        }
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
        expect(impulse.x).toBeLessThanOrEqual(0.00637);
    });

    it('should use 100% force for reserves difficulty', () => {
        calculateCpuImpulse(null, null, 800, 600, 'reserves');
        for (let i = 0; i < 15; i++) {
            calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'reserves');
        }
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'reserves');
        expect(impulse.x).toBeCloseTo(0.0106, 3);
    });

    it('should use 120% force for first-team difficulty', () => {
        calculateCpuImpulse(null, null, 800, 600, 'first-team');
        for (let i = 0; i < 5; i++) {
            calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'first-team');
        }
        const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'first-team');
        expect(impulse.x).toBeCloseTo(0.0127, 3);
    });
});

describe('calculateCpuImpulse - Reaction Delay', () => {
  const mockPlayer = { position: { x: 0, y: 0 } } as Matter.Body;
  const mockBall = { position: { x: 100, y: 100 } } as Matter.Body;
  beforeEach(() => resetCpuState());

  it('should return zero impulse for the first 30 frames in academy mode', () => {
    calculateCpuImpulse(null, null, 800, 600, 'academy'); 

    for (let i = 0; i < 29; i++) {
      const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
      expect(impulse).toEqual({ x: 0, y: 0 });
    }
  });

  it('should return zero impulse for the first 30 frames in reserves mode', () => {
    calculateCpuImpulse(null, null, 800, 600, 'reserves'); 

    for (let i = 0; i < 14; i++) {
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