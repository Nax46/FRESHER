"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawNumber = exports.publishWinnerControl = exports.approveWinnerControl = exports.getGameResults = exports.closeGameControl = exports.nextQuestionControl = exports.startGameControl = exports.openGameControl = exports.getGameLibrary = exports.getDashboardMetrics = void 0;
const Game_js_1 = require("../models/Game.js");
const Student_js_1 = require("../models/Student.js");
const Winner_js_1 = require("../models/Winner.js");
const Event_js_1 = require("../models/Event.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
const cacheService_js_1 = require("../services/cacheService.js");
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
        totalQuestions: 3
    },
    {
        _id: 'game_lyrics_02',
        title: '🎵 Finish the Lyrics',
        subtitle: 'Complete the missing song line before anyone else',
        type: 'SPEED_MCQ',
        status: 'READY',
        timeLimit: 30,
        prize: 50,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'FIRST_CORRECT',
        description: 'Test your Bollywood music knowledge in real-time!',
        totalQuestions: 3
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
        totalQuestions: 3
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
        totalQuestions: 2
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
        totalQuestions: 2
    },
    {
        _id: 'game_faculty_06',
        title: '🎯 Faculty 1v1',
        subtitle: 'Student vs Faculty stage showdown',
        type: 'LUCKY_NUMBER',
        status: 'READY',
        timeLimit: 120,
        prize: 200,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'MANUAL_SELECT',
        description: 'Draw Lucky Number → Student competes live against a professor!',
        totalQuestions: 1
    },
    {
        _id: 'game_audience_07',
        title: '🙈 Never Have I Ever',
        subtitle: 'Audience interactive participation',
        type: 'AUDIENCE',
        status: 'READY',
        timeLimit: 60,
        prize: 0,
        attemptRule: 'MULTIPLE_ATTEMPTS',
        winnerRule: 'MANUAL_SELECT',
        description: 'Fun ice-breaking audience poll.',
        totalQuestions: 2
    },
    {
        _id: 'game_physical_08',
        title: '⚡ 30-Second Challenge',
        subtitle: 'Physical quick task on stage',
        type: 'PHYSICAL',
        status: 'READY',
        timeLimit: 30,
        prize: 50,
        attemptRule: 'ONE_ATTEMPT',
        winnerRule: 'MANUAL_SELECT',
        description: 'Physical rapid-fire activity on stage.',
        totalQuestions: 1
    }
];
const getDashboardMetrics = async (req, res) => {
    try {
        let totalStudents = 0;
        let onlineStudents = 0;
        let totalGames = 8;
        let totalWinners = 0;
        try {
            totalStudents = await Student_js_1.Student.countDocuments();
            onlineStudents = await Student_js_1.Student.countDocuments({ isOnline: true });
            totalGames = await Game_js_1.Game.countDocuments() || 8;
            totalWinners = await Winner_js_1.Winner.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } });
        }
        catch (dbErr) { }
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
                    totalGames,
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
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
    let event = null;
    try {
        event = await Event_js_1.EventModel.findOne({});
    }
    catch (err) { }
    const eventId = event ? event._id.toString() : 'FRESHER2026';
    try {
        const drawn = await gameEngine_js_1.gameEngine.drawRandomNumber(type, eventId);
        return res.json({ success: true, data: drawn });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.drawNumber = drawNumber;
