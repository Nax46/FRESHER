"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAllStudentsControl = exports.drawNumber = exports.publishWinnerControl = exports.approveWinnerControl = exports.getGameResults = exports.closeGameControl = exports.nextQuestionControl = exports.startGameControl = exports.openGameControl = exports.getGameLibrary = exports.getDashboardMetrics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Game_js_1 = require("../models/Game.js");
const Student_js_1 = require("../models/Student.js");
const Winner_js_1 = require("../models/Winner.js");
const Participant_js_1 = require("../models/Participant.js");
const Submission_js_1 = require("../models/Submission.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
const cacheService_js_1 = require("../services/cacheService.js");
const tokenService_js_1 = require("../services/tokenService.js");
const pino_js_1 = require("../config/pino.js");
const DEFAULT_GAMES = [
    {
        _id: 'game_emoji_01',
        title: '😂 Guess the Emoji',
        subtitle: 'Identify the movie or phrase represented by emojis',
        type: 'SPEED_MCQ',
        status: 'READY',
        timeLimit: 30,
        prize: 50,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'FIRST_CORRECT',
        description: 'First valid correct submission wins instant ₹50 cash prize!',
        totalQuestions: 10
    },
    {
        _id: 'game_quote_03',
        title: '👀 Who Said This?',
        subtitle: 'Identify which iconic professor or celebrity said this quote',
        type: 'SPEED_MCQ',
        status: 'READY',
        timeLimit: 20,
        prize: 50,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'FIRST_CORRECT',
        description: 'Guess the speaker instantly!',
        totalQuestions: 10
    },
    {
        _id: 'game_dialogue_04',
        title: '🎬 Complete the Dialogue',
        subtitle: 'Spotlight number stage challenge',
        type: 'SPOTLIGHT_CHALLENGE',
        status: 'READY',
        timeLimit: 60,
        prize: 100,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'JUDGE_SCORE',
        description: 'Draw Spotlight Number → Student comes to stage to perform dialogue.',
        totalQuestions: 5
    },
    {
        _id: 'game_memory_05',
        title: '🧠 Memory Challenge',
        subtitle: 'Remember the sequence shown on screen',
        type: 'SPOTLIGHT_CHALLENGE',
        status: 'READY',
        timeLimit: 60,
        prize: 100,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'JUDGE_SCORE',
        description: 'Visual memory test for spotlight selected student!',
        totalQuestions: 5
    }
];
const getDashboardMetrics = async (req, res) => {
    try {
        const cacheTotal = cacheService_js_1.cacheService.getStudentCount();
        const cacheOnline = cacheService_js_1.cacheService.getOnlineStudentCount();
        let dbTotal = 0;
        let dbOnline = 0;
        let dbWinners = 0;
        try {
            dbTotal = await Promise.race([
                Student_js_1.Student.countDocuments(),
                new Promise((res) => setTimeout(() => res(0), 200))
            ]);
            dbOnline = await Promise.race([
                Student_js_1.Student.countDocuments({
                    $or: [
                        { isOnline: true },
                        { lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }
                    ]
                }),
                new Promise((res) => setTimeout(() => res(0), 200))
            ]);
            dbWinners = await Promise.race([
                Winner_js_1.Winner.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } }),
                new Promise((res) => setTimeout(() => res(0), 200))
            ]);
        }
        catch (dbErr) { }
        const totalStudents = Math.max(cacheTotal, dbTotal);
        let onlineStudents = Math.max(cacheOnline, dbOnline);
        if (onlineStudents > totalStudents)
            onlineStudents = totalStudents;
        const totalWinners = dbWinners;
        const totalTokens = totalStudents;
        const activeGame = cacheService_js_1.cacheService.getActiveGame();
        let currentGameData = null;
        if (activeGame) {
            currentGameData = {
                gameId: activeGame.gameId,
                title: activeGame.title,
                type: activeGame.type,
                status: activeGame.status,
                joinedCount: activeGame.joinedStudentIds.size,
                totalSubmissions: activeGame.submissions.size,
                currentQuestionIndex: activeGame.currentQuestionIndex,
                totalQuestions: activeGame.totalQuestions
            };
        }
        let latestWinnerCandidate = null;
        try {
            const candidateDoc = await Winner_js_1.Winner.findOne({ status: { $in: ['CANDIDATE', 'APPROVED'] } })
                .sort({ createdAt: -1 })
                .populate('studentId gameId');
            if (candidateDoc && candidateDoc.studentId) {
                const student = candidateDoc.studentId;
                const game = candidateDoc.gameId;
                latestWinnerCandidate = {
                    winnerId: candidateDoc._id,
                    studentId: student._id,
                    name: student.name,
                    tokenNo: student.tokenNo,
                    enrollmentNo: student.enrollmentNo,
                    responseTimeMs: candidateDoc.responseTimeMs,
                    correctAnswer: candidateDoc.selectedAnswerText,
                    status: candidateDoc.status,
                    gameTitle: game ? game.title : ''
                };
            }
        }
        catch (err) { }
        return res.json({
            success: true,
            data: {
                metrics: {
                    totalStudents,
                    onlineStudents,
                    totalGames: 4,
                    totalWinners,
                    totalTokens: totalStudents
                },
                currentGame: currentGameData,
                winnerCandidate: latestWinnerCandidate
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Dashboard error' });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
const getGameLibrary = async (req, res) => {
    try {
        let games = await Game_js_1.Game.find({}).sort({ createdAt: 1 });
        if (!games || games.length === 0) {
            games = DEFAULT_GAMES;
        }
        return res.json({ success: true, data: games });
    }
    catch (error) {
        pino_js_1.logger.warn('Falling back to default games library');
        return res.json({ success: true, data: DEFAULT_GAMES });
    }
};
exports.getGameLibrary = getGameLibrary;
const openGameControl = async (req, res) => {
    const id = req.params.id;
    const eventId = 'FRESHER2026';
    try {
        const active = await gameEngine_js_1.gameEngine.openGame(id, eventId);
        return res.json({ success: true, data: active });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.openGameControl = openGameControl;
const startGameControl = async (req, res) => {
    const id = req.params.id;
    const eventId = 'FRESHER2026';
    try {
        const active = await gameEngine_js_1.gameEngine.startGame(id, eventId);
        return res.json({ success: true, data: active });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.startGameControl = startGameControl;
const nextQuestionControl = async (req, res) => {
    const id = req.params.id;
    const eventId = 'FRESHER2026';
    try {
        const active = await gameEngine_js_1.gameEngine.nextQuestion(id, eventId);
        return res.json({ success: true, data: active });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.nextQuestionControl = nextQuestionControl;
const closeGameControl = async (req, res) => {
    const id = req.params.id;
    const eventId = 'FRESHER2026';
    try {
        const result = await gameEngine_js_1.gameEngine.closeGame(id, eventId);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.closeGameControl = closeGameControl;
const getGameResults = async (req, res) => {
    const id = req.params.id;
    let winnerCandidate = null;
    try {
        winnerCandidate = await Winner_js_1.Winner.findOne({ gameId: id }).sort({ createdAt: -1 }).populate('studentId gameId');
    }
    catch (err) { }
    const active = cacheService_js_1.cacheService.getActiveGame();
    let submissionsSummary = {
        totalSubmissions: 0,
        correctCount: 0,
        wrongCount: 0
    };
    if (active && active.gameId === id) {
        const subs = Array.from(active.submissions.values());
        submissionsSummary.totalSubmissions = subs.length;
        submissionsSummary.correctCount = subs.filter(s => s.isCorrect).length;
        submissionsSummary.wrongCount = subs.filter(s => !s.isCorrect).length;
    }
    return res.json({
        success: true,
        data: {
            candidate: winnerCandidate,
            summary: submissionsSummary
        }
    });
};
exports.getGameResults = getGameResults;
const approveWinnerControl = async (req, res) => {
    const winnerId = req.params.winnerId;
    const eventId = 'FRESHER2026';
    try {
        const winner = await gameEngine_js_1.gameEngine.approveWinner(winnerId, 'Management Admin', eventId);
        return res.json({ success: true, data: winner });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.approveWinnerControl = approveWinnerControl;
const publishWinnerControl = async (req, res) => {
    const winnerId = req.params.winnerId;
    const eventId = 'FRESHER2026';
    try {
        const winner = await gameEngine_js_1.gameEngine.publishWinner(winnerId, eventId);
        return res.json({ success: true, data: winner });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.publishWinnerControl = publishWinnerControl;
const drawNumber = async (req, res) => {
    const { type } = req.body;
    const eventId = 'FRESHER2026';
    try {
        const drawn = await gameEngine_js_1.gameEngine.drawRandomNumber(type, eventId);
        return res.json({ success: true, data: drawn });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.drawNumber = drawNumber;
const resetAllStudentsControl = async (req, res) => {
    try {
        // 1. Clear in-memory student cache & reset token counters
        cacheService_js_1.cacheService.clearAllStudentSessions();
        tokenService_js_1.TokenService.resetCounters();
        // 2. Clear Database documents safely
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                await Student_js_1.Student.deleteMany({});
                await Participant_js_1.Participant.deleteMany({});
                await Submission_js_1.Submission.deleteMany({});
                await Winner_js_1.Winner.deleteMany({});
            }
        }
        catch (dbErr) {
            pino_js_1.logger.error({ err: dbErr }, 'Error clearing DB documents during student reset');
        }
        // 3. Emit real-time force logout broadcast to all connected student sockets
        const io = req.app.get('io');
        if (io) {
            io.emit('FORCE_LOGOUT_ALL', { message: 'All student sessions reset by host.' });
            io.emit('METRICS_UPDATED', {
                totalStudents: 0,
                onlineStudents: 0,
                totalGames: 4,
                totalTokens: 0
            });
        }
        pino_js_1.logger.info('🗑️ ALL STUDENT SESSIONS & RECORDS PURGED BY ADMIN');
        return res.json({
            success: true,
            message: 'All student records purged, tokens reset, and active sessions logged out.'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to reset student sessions' });
    }
};
exports.resetAllStudentsControl = resetAllStudentsControl;
