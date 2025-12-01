import { describe, it, expect } from 'vitest';
import {
  initializeMastery,
  applyMasteryUpdates,
  argsToQuestion,
} from '../lib/studySession.utils';
import type { TopicMastery, GetNextStepArgs } from '../lib/studySession.types';

describe('studySession.utils', () => {
  describe('initializeMastery', () => {
    it('should initialize mastery for each topic with zero values', () => {
      const topics = ['React', 'TypeScript', 'Testing'];
      const result = initializeMastery(topics);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        topic: 'React',
        level: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
      });
      expect(result[1]).toEqual({
        topic: 'TypeScript',
        level: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
      });
    });

    it('should handle empty topics array', () => {
      const result = initializeMastery([]);
      expect(result).toEqual([]);
    });

    it('should handle single topic', () => {
      const result = initializeMastery(['JavaScript']);
      expect(result).toHaveLength(1);
      expect(result[0].topic).toBe('JavaScript');
    });
  });

  describe('applyMasteryUpdates', () => {
    const initialMastery: TopicMastery[] = [
      { topic: 'React', level: 50, questionsAnswered: 5, questionsCorrect: 3 },
      { topic: 'TypeScript', level: 30, questionsAnswered: 3, questionsCorrect: 1 },
    ];

    it('should update mastery level for matching topic', () => {
      const updates = [
        { topic: 'React', newLevel: 66, reasoning: 'Correct answer' },
      ];

      const result = applyMasteryUpdates(initialMastery, updates);

      expect(result[0].level).toBe(65);
      expect(result[1].level).toBe(30); // Unchanged
    });

    it('should update multiple topics', () => {
      const updates = [
        { topic: 'React', newLevel: 60, reasoning: 'Improved' },
        { topic: 'TypeScript', newLevel: 45, reasoning: 'Good progress' },
      ];

      const result = applyMasteryUpdates(initialMastery, updates);

      expect(result[0].level).toBe(60);
      expect(result[1].level).toBe(45);
    });

    it('should clamp level to 0-100 range (prevent negative)', () => {
      const updates = [
        { topic: 'React', newLevel: -10, reasoning: 'Should clamp to 0' },
      ];

      const result = applyMasteryUpdates(initialMastery, updates);
      expect(result[0].level).toBe(0);
    });

    it('should clamp level to 0-100 range (prevent over 100)', () => {
      const updates = [
        { topic: 'React', newLevel: 150, reasoning: 'Should clamp to 100' },
      ];

      const result = applyMasteryUpdates(initialMastery, updates);
      expect(result[0].level).toBe(100);
    });

    it('should handle empty updates array', () => {
      const result = applyMasteryUpdates(initialMastery, []);

      expect(result[0].level).toBe(50);
      expect(result[1].level).toBe(30);
    });
  });

  describe('argsToQuestion', () => {
    it('should convert GetNextStepArgs to StudyQuestion', () => {
      const args: GetNextStepArgs = {
        questionType: 'multiple-choice',
        topic: 'React',
        difficulty: 'medium',
        question: 'What is a component?',
        options: [
          { text: 'A function', explanation: 'Correct! Components can be functions.' },
          { text: 'A class', explanation: 'Also correct! Components can be classes.' },
          { text: 'Both', explanation: 'Exactly right! Components can be either functions or classes.' },
          { text: 'Neither', explanation: 'Incorrect. Components are indeed functions or classes.' },
        ],
        correctAnswer: 'Both',
        reasoning: 'Testing component knowledge',
      };

      const result = argsToQuestion(args, 'q-123');

      expect(result).toEqual({
        id: 'q-123',
        type: 'multiple-choice',
        topic: 'React',
        difficulty: 'medium',
        question: 'What is a component?',
        options: [
          { text: 'A function', explanation: 'Correct! Components can be functions.' },
          { text: 'A class', explanation: 'Also correct! Components can be classes.' },
          { text: 'Both', explanation: 'Exactly right! Components can be either functions or classes.' },
          { text: 'Neither', explanation: 'Incorrect. Components are indeed functions or classes.' },
        ],
        correctAnswer: 'Both',
      });
    });

    it('should handle short-answer questions without options', () => {
      const args: GetNextStepArgs = {
        questionType: 'short-answer',
        topic: 'TypeScript',
        difficulty: 'hard',
        question: 'Explain generics',
        correctAnswer: 'Type parameters for reusable code',
        reasoning: 'Advanced TypeScript concepts',
      };

      const result = argsToQuestion(args, 'q-456');

      expect(result.type).toBe('short-answer');
      expect(result.options).toBeUndefined();
      expect(result.correctAnswer).toBe('Type parameters for reusable code');
    });

    it('should handle true-false questions', () => {
      const args: GetNextStepArgs = {
        questionType: 'true-false',
        topic: 'JavaScript',
        difficulty: 'easy',
        question: 'Is JavaScript single-threaded?',
        options: [
          { text: 'True', explanation: 'Correct! JavaScript executes on a single thread.' },
          { text: 'False', explanation: 'Incorrect. JavaScript is single-threaded.' },
        ],
        correctAnswer: 'True',
        reasoning: 'Basic JS concepts',
      };

      const result = argsToQuestion(args, 'q-789');

      expect(result.type).toBe('true-false');
      expect(result.options).toEqual([
        { text: 'True', explanation: 'Correct! JavaScript executes on a single thread.' },
        { text: 'False', explanation: 'Incorrect. JavaScript is single-threaded.' },
      ]);
    });
  });
});
