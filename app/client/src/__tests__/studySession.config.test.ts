import { describe, it, expect } from 'vitest';
import {
  isTopicMastered,
  getDifficultyForMastery,
  STUDY_SESSION_CONFIG,
} from '../lib/studySession.config';

describe('studySession.config', () => {
  describe('isTopicMastered', () => {
    it('should return true when mastery is at threshold (80%)', () => {
      expect(isTopicMastered(80)).toBe(true);
    });

    it('should return true when mastery exceeds threshold', () => {
      expect(isTopicMastered(85)).toBe(true);
      expect(isTopicMastered(90)).toBe(true);
      expect(isTopicMastered(100)).toBe(true);
    });

    it('should return false when mastery is below threshold', () => {
      expect(isTopicMastered(79)).toBe(false);
      expect(isTopicMastered(50)).toBe(false);
      expect(isTopicMastered(0)).toBe(false);
    });

    it('should use config threshold value', () => {
      const threshold = STUDY_SESSION_CONFIG.mastery.masteryThreshold;
      expect(isTopicMastered(threshold)).toBe(true);
      expect(isTopicMastered(threshold - 1)).toBe(false);
    });
  });

  describe('getDifficultyForMastery', () => {
    describe('easy difficulty (0-40%)', () => {
      it('should return easy for 0% mastery', () => {
        expect(getDifficultyForMastery(0)).toBe('easy');
      });

      it('should return easy for low mastery', () => {
        expect(getDifficultyForMastery(20)).toBe('easy');
        expect(getDifficultyForMastery(30)).toBe('easy');
      });

      it('should return easy for boundary (40%)', () => {
        expect(getDifficultyForMastery(40)).toBe('easy');
      });
    });

    describe('medium difficulty (41-70%)', () => {
      it('should return medium just above easy threshold', () => {
        expect(getDifficultyForMastery(41)).toBe('medium');
      });

      it('should return medium for mid-range mastery', () => {
        expect(getDifficultyForMastery(50)).toBe('medium');
        expect(getDifficultyForMastery(60)).toBe('medium');
      });

      it('should return medium at boundary (70%)', () => {
        expect(getDifficultyForMastery(70)).toBe('medium');
      });
    });

    describe('hard difficulty (71-100%)', () => {
      it('should return hard just above medium threshold', () => {
        expect(getDifficultyForMastery(71)).toBe('hard');
      });

      it('should return hard for high mastery', () => {
        expect(getDifficultyForMastery(80)).toBe('hard');
        expect(getDifficultyForMastery(90)).toBe('hard');
      });

      it('should return hard for perfect mastery', () => {
        expect(getDifficultyForMastery(100)).toBe('hard');
      });
    });

    describe('adaptive progression', () => {
      it('should escalate difficulty as student improves', () => {
        // Simulating a student's progression
        expect(getDifficultyForMastery(0)).toBe('easy');
        expect(getDifficultyForMastery(25)).toBe('easy');
        expect(getDifficultyForMastery(45)).toBe('medium');
        expect(getDifficultyForMastery(65)).toBe('medium');
        expect(getDifficultyForMastery(75)).toBe('hard');
        expect(getDifficultyForMastery(85)).toBe('hard');
      });
    });
  });

  describe('STUDY_SESSION_CONFIG constants', () => {
    it('should have valid mastery threshold', () => {
      const threshold = STUDY_SESSION_CONFIG.mastery.masteryThreshold;
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(100);
    });

    it('should have valid difficulty thresholds', () => {
      const { easy, medium, hard } = STUDY_SESSION_CONFIG.mastery.difficultyThresholds;
      
      expect(easy.min).toBe(0);
      expect(easy.max).toBeLessThan(medium.min);
      expect(medium.max).toBeLessThan(hard.min);
      expect(hard.max).toBe(100);
    });

    it('should have valid mastery adjustments', () => {
      const { correctAnswerBonus, incorrectAnswerPenalty } = 
        STUDY_SESSION_CONFIG.mastery.adjustments;
      
      expect(correctAnswerBonus).toBeGreaterThan(0);
      expect(incorrectAnswerPenalty).toBeGreaterThan(0);
    });

    it('should have valid session config', () => {
      const { minQuestions, maxQuestionsPerTopic } = STUDY_SESSION_CONFIG.session;
      
      expect(minQuestions).toBeGreaterThan(0);
      expect(maxQuestionsPerTopic).toBeGreaterThan(minQuestions);
    });
  });
});
