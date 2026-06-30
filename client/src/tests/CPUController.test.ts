// src/components/GameCanvas/CPU/CPUController.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCpuImpulse } from '../components/Game/CPUGameCanvas/CPUController';

describe('calculateCpuImpulse', () => {
  it('should accept a difficulty level', () => {
    const mockPlayer = { position: { x: 0, y: 0 } } as Matter.Body;
    const mockBall = { position: { x: 10, y: 10 } } as Matter.Body;
    
    const impulse = calculateCpuImpulse(mockPlayer, mockBall, 800, 600, 'academy');
    
    expect(impulse).toBeDefined();
  });
});