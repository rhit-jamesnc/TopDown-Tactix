import { describe, test, expect } from 'vitest';
import { checkWin } from '../winCondition.js';

describe('Win Condition Logic', () => {
  test('returns false when score is 0', () => {
    expect(checkWin(0, 1)).toBe(false);
  });

  test('returns true when score reaches the limit of 1', () => {
    expect(checkWin(1, 1)).toBe(true);
  });

  test('returns true when score exceeds the limit', () => {
    expect(checkWin(2, 1)).toBe(true);
  });

  test('returns true when score reaches 5 goal limit', () => {
    expect(checkWin(5, 5)).toBe(true);
  });

  test('returns false when score is below 5 goal limit', () => {
    expect(checkWin(4, 5)).toBe(false);
  });
});