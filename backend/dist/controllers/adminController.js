"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawNumber = exports.publishWinnerControl = exports.approveWinnerControl = exports.getGameResults = exports.closeGameControl = exports.nextQuestionControl = exports.startGameControl = exports.openGameControl = exports.getGameLibrary = exports.getDashboardMetrics = void 0;
const Game_js_1 = require("../models/Game.js");
const Student_js_1 = require("../models/Student.js");
const Winner_js_1 = require("../models/Winner.js");
const Event_js_1 = require("../models/Event.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
const cacheService_js_1 = require("../services/cacheService.js");
const getDashboardMetrics = async (req, res) => {
    const totalStudents = await Student_js_1.Student.countDocuments();
    const onlineStudents = await Student_js_1.Student.countDocuments({ isOnline: true });
    const totalGames = await Game_js_1.Game.countDocuments();
    const totalWinners = await Winner_js_1.Winner.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } });
    const activeGame = cacheService_js_1.cacheService.getActiveGame();
    let currentGameData = null;
    if (activeGame) {
        currentGameData = {
            gameId: activeGame.gameId,
            title: activeGame.title,
            type: activeGame.type,
            status: activeGame.status,
            joinedCount: activeGame.joinedStudentIds.size,
            totalSubmissions: activeGame.submissions.size
        };
    }
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
            currentGame: currentGameData
        }
    });
};
exports.getDashboardMetrics = getDashboardMetrics;
const getGameLibrary = async (req, res) => {
    const games = await Game_js_1.Game.find({}).sort({ createdAt: 1 });
    return res.json({ success: true, data: games });
};
exports.getGameLibrary = getGameLibrary;
const openGameControl = async (req, res) => {
    const id = req.params.id;
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const winnerCandidate = await Winner_js_1.Winner.findOne({ gameId: id }).sort({ createdAt: -1 }).populate('studentId gameId');
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
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
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
    const { type } = req.body; // 'SPOTLIGHT' | 'LUCKY'
    const event = await Event_js_1.EventModel.findOne({});
    const eventId = event ? event._id.toString() : 'default';
    try {
        const drawn = await gameEngine_js_1.gameEngine.drawRandomNumber(type, eventId);
        return res.json({ success: true, data: drawn });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.drawNumber = drawNumber;
