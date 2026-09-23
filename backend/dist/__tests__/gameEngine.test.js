"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cacheService_js_1 = require("../services/cacheService.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
(0, vitest_1.describe)('GameEngine Atomic Winner Lock & State Machine', () => {
    let engine;
    (0, vitest_1.beforeEach)(() => {
        engine = new gameEngine_js_1.GameEngine();
        cacheService_js_1.cacheService.clearActiveGame();
    });
    (0, vitest_1.it)('should lock candidate winner on first valid correct submission', () => {
        cacheService_js_1.cacheService.setActiveGame({
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
        (0, vitest_1.expect)(resA.isCorrect).toBe(false);
        (0, vitest_1.expect)(resA.isWinnerCandidate).toBe(false);
        // Student B submits correct answer
        const resB = engine.submitAnswer('game_123', 'student_B', 1);
        (0, vitest_1.expect)(resB.isCorrect).toBe(true);
        (0, vitest_1.expect)(resB.isWinnerCandidate).toBe(true);
        // Student C submits correct answer 5ms later
        cacheService_js_1.cacheService.getActiveGame()?.joinedStudentIds.add('student_C');
        const resC = engine.submitAnswer('game_123', 'student_C', 1);
        (0, vitest_1.expect)(resC.isCorrect).toBe(true);
        (0, vitest_1.expect)(resC.isWinnerCandidate).toBe(false); // Locked by B!
        // Verify active game winner candidate is student_B
        const active = cacheService_js_1.cacheService.getActiveGame();
        (0, vitest_1.expect)(active?.winnerCandidateId).toBe('student_B');
    });
    (0, vitest_1.it)('should reject submission if game is not in LIVE state', () => {
        cacheService_js_1.cacheService.setActiveGame({
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
        (0, vitest_1.expect)(() => {
            engine.submitAnswer('game_123', 'student_A', 1);
        }).toThrow('Game is not accepting submissions');
    });
});
