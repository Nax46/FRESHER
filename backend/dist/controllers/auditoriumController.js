"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuditoriumState = exports.getAuditoriumState = void 0;
const Event_js_1 = require("../models/Event.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
const getAuditoriumState = async (req, res) => {
    const event = await Event_js_1.EventModel.findOne({});
    if (!event) {
        return res.json({
            success: true,
            data: {
                state: 'WELCOME',
                payload: { title: '🎉 FRESHER 2026', message: 'Welcome to the Game Arena!' }
            }
        });
    }
    return res.json({
        success: true,
        data: event.auditoriumState
    });
};
exports.getAuditoriumState = getAuditoriumState;
const setAuditoriumState = async (req, res) => {
    const { state, payload } = req.body;
    const event = await Event_js_1.EventModel.findOne({});
    if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
    }
    event.auditoriumState = {
        state,
        payload: payload || {},
        updatedAt: new Date()
    };
    await event.save();
    // Socket broadcast to auditorium channel
    if (gameEngine_js_1.gameEngine.io) {
        gameEngine_js_1.gameEngine.io.to(`auditorium:${event._id}`).emit('AUDITORIUM_UPDATED', event.auditoriumState);
    }
    return res.json({ success: true, data: event.auditoriumState });
};
exports.setAuditoriumState = setAuditoriumState;
