import { describe, it, expect } from 'vitest';
import { calculateMasteryLevel } from '../lib/studySession.utils';

describe('calculateMasteryLevel', () => {
  describe('initial questions (< 5 answered)', () => {
    it('should return 0 when no questions answered', () => {
      expect(calculateMasteryLevel(0, 0)).toBe(0);
    });

    it('should cap mastery at 52% when 1 question answered correctly', () => {
      expect(calculateMasteryLevel(1, 1)).toBe(52);
    });

    it('should calculate 32% when 1/2 questions correct', () => {
      // maxPossible = 40 + (2 * 12) = 64
      // accuracy = 1/2 = 0.5
      // level = 0.5 * 64 = 32
      expect(calculateMasteryLevel(1, 2)).toBe(32);
    });

    it('should calculate 64% when 2/2 questions correct', () => {
      // maxPossible = 40 + (2 * 12) = 64
      // accuracy = 2/2 = 1.0
      expect(calculateMasteryLevel(2, 2)).toBe(64);
    });

    it('should calculate 51% when 2/3 questions correct', () => {
      // maxPossible = 40 + (3 * 12) = 76
      // accuracy = 2/3 ≈ 0.667
      // level = 0.667 * 76 ≈ 50.7 -> 51
      expect(calculateMasteryLevel(2, 3)).toBe(51);
    });

    it('should cap at 88% when 4/4 questions correct (before full unlock)', () => {
      // maxPossible = 40 + (4 * 12) = 88
      expect(calculateMasteryLevel(4, 4)).toBe(88);
    });
  });

  describe('established mastery (≥ 5 questions)', () => {
    it('should allow 100% mastery when 5/5 correct', () => {
      // maxPossible = 100 (unlocked at 5)
      // accuracy = 5/5 = 1.0
      expect(calculateMasteryLevel(5, 5)).toBe(100);
    });

    it('should calculate 80% when 4/5 correct', () => {
      // maxPossible = 100
      // accuracy = 4/5 = 0.8
      expect(calculateMasteryLevel(4, 5)).toBe(80);
    });

    it('should calculate 60% when 3/5 correct', () => {
      // maxPossible = 100
      // accuracy = 3/5 = 0.6
      expect(calculateMasteryLevel(3, 5)).toBe(60);
    });

    it('should calculate 90% when 9/10 correct', () => {
      expect(calculateMasteryLevel(9, 10)).toBe(90);
    });

    it('should calculate 75% when 15/20 correct', () => {
      expect(calculateMasteryLevel(15, 20)).toBe(75);
    });

    it('should handle perfect score on large dataset', () => {
      expect(calculateMasteryLevel(50, 50)).toBe(100);
    });

    it('should handle very low accuracy on large dataset', () => {
      // 1/20 = 5% -> rounds to 5
      expect(calculateMasteryLevel(1, 20)).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should never exceed 100', () => {
      expect(calculateMasteryLevel(100, 100)).toBe(100);
      expect(calculateMasteryLevel(1000, 1000)).toBe(100);
    });

    it('should round to nearest integer', () => {
      expect(calculateMasteryLevel(1, 3)).toBe(25);
    });

    it('should handle 0 correct answers', () => {
      expect(calculateMasteryLevel(0, 5)).toBe(0);
      expect(calculateMasteryLevel(0, 10)).toBe(0);
    });
  });

  describe('progressive difficulty concept', () => {
    it('should reward early success but not too much (prevent quick mastery)', () => {
      expect(calculateMasteryLevel(1, 1)).toBeLessThan(60);
      expect(calculateMasteryLevel(2, 2)).toBeLessThan(70);
      expect(calculateMasteryLevel(3, 3)).toBeLessThan(80);
    });

    it('should unlock full mastery potential after 5 questions', () => {
      // After 5 questions, 100% becomes achievable
      const before = calculateMasteryLevel(4, 4);
      const after = calculateMasteryLevel(5, 5);
      
      expect(before).toBeLessThan(100);
      expect(after).toBe(100);
    });
  });
});
