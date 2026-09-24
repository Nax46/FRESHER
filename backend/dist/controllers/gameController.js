"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAnswer = exports.joinGame = void 0;
const gameEngine_js_1 = require("../services/gameEngine.js");
const Event_js_1 = require("../models/Event.js");
const joinGame = async (req, res) => {
    const gameId = req.params.gameId;
    const { studentId } = req.body;
    if (!studentId) {
        return res.status(400).json({ success: false, error: 'Student ID required' });
    }
    try {
        let eventId = 'FRESHER2026';
        try {
            const defaultEvent = await Event_js_1.EventModel.findOne({});
            if (defaultEvent)
                eventId = defaultEvent._id.toString();
        }
        catch (err) {
            // Fallback cleanly to default event if DB is connecting
        }
        const result = await gameEngine_js_1.gameEngine.joinGame(gameId, studentId, eventId);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.joinGame = joinGame;
const submitAnswer = async (req, res) => {
    const { gameId, selectedOptionIndex, studentId } = req.body;
    if (!studentId) {
        return res.status(400).json({ success: false, error: 'Student ID required' });
    }
    try {
        const result = gameEngine_js_1.gameEngine.submitAnswer(gameId, studentId, selectedOptionIndex);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};
exports.submitAnswer = submitAnswer;
