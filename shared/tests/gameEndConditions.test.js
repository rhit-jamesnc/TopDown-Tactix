import { describe, test, expect } from 'vitest';
import { checkGoalWin, checkTimeExpiry } from '../gameEndConditions.js';

describe('Game End Logic - Goal Limit', () => {
  test('returns false when score is 0', () => {
    expect(checkGoalWin(0, 1)).toBe(false);
  });

  test('returns true when score reaches the limit of 1', () => {
    expect(checkGoalWin(1, 1)).toBe(true);
  });

  test('returns true when score exceeds the limit', () => {
    expect(checkGoalWin(2, 1)).toBe(true);
  });

  test('returns true when score reaches 5 goal limit', () => {
    expect(checkGoalWin(5, 5)).toBe(true);
  });

  test('returns false when score is below 5 goal limit', () => {
    expect(checkGoalWin(4, 5)).toBe(false);
  });
});

describe('Game End Logic - Time Expiry', () => {
  test('declares win if player has more goals', () => {
      expect(checkTimeExpiry(3, 2)).toBe('win');
    });

    test('declares loss if player has fewer goals', () => {
      expect(checkTimeExpiry(2, 3)).toBe('loss');
    });

    test('declares draw if scores are equal', () => {
      expect(checkTimeExpiry(2, 2)).toBe('draw');
    });
});