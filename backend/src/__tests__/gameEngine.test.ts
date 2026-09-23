import { describe, it, expect, beforeEach } from 'vitest';
import { cacheService } from '../services/cacheService.js';
import { GameEngine } from '../services/gameEngine.js';

describe('GameEngine Atomic Winner Lock & State Machine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    cacheService.clearActiveGame();
  });

  it('should lock candidate winner on first valid correct submission', () => {
    cacheService.setActiveGame({
      gameId: 'game_123',
      title: 'Guess the Emoji',
      type: 'SPEED_MCQ',
      status: 'LIVE',
      timeLimit: 30,
      prize: 50,
      currentQuestionIndex: 0,
      totalQuestions: 1,
      startTime: Date.now() - 500,
      joinedStudentIds: new Set(['student_A', 'student_B']),
      submissions: new Map(),
      questions: [
        {
          id: 'q_1',
          questionText: 'Lion King',
          mediaContent: '🦁+👑',
          options: ['Jungle Book', 'Lion King', 'Madagascar', 'Simba'],
          correctOptionIndex: 1,
          order: 1
        }
      ]
    });

    // Student A submits wrong answer
    const resA = engine.submitAnswer('game_123', 'student_A', 0);
    expect(resA.isCorrect).toBe(false);
    expect(resA.isWinnerCandidate).toBe(false);

    // Student B submits correct answer
    const resB = engine.submitAnswer('game_123', 'student_B', 1);
    expect(resB.isCorrect).toBe(true);
    expect(resB.isWinnerCandidate).toBe(true);

    // Student C submits correct answer 5ms later
    cacheService.getActiveGame()?.joinedStudentIds.add('student_C');
    const resC = engine.submitAnswer('game_123', 'student_C', 1);
    expect(resC.isCorrect).toBe(true);
    expect(resC.isWinnerCandidate).toBe(false); // Locked by B!

    // Verify active game winner candidate is student_B
    const active = cacheService.getActiveGame();
    expect(active?.winnerCandidateId).toBe('student_B');
  });

  it('should reject submission if game is not in LIVE state', () => {
    cacheService.setActiveGame({
      gameId: 'game_123',
      title: 'Guess the Emoji',
      type: 'SPEED_MCQ',
      status: 'OPEN', // Not LIVE yet
      timeLimit: 30,
      prize: 50,
      currentQuestionIndex: 0,
      totalQuestions: 1,
      questions: [],
      joinedStudentIds: new Set(['student_A']),
      submissions: new Map()
    });

    expect(() => {
      engine.submitAnswer('game_123', 'student_A', 1);
    }).toThrow('Game is not accepting submissions');
  });
});
