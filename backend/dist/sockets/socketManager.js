"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketManager = exports.broadcastMetrics = void 0;
const pino_js_1 = require("../config/pino.js");
const gameEngine_js_1 = require("../services/gameEngine.js");
const Student_js_1 = require("../models/Student.js");
const cacheService_js_1 = require("../services/cacheService.js");
const broadcastMetrics = async (io) => {
    let totalStudents = cacheService_js_1.cacheService.getStudentCount();
    let onlineStudents = cacheService_js_1.cacheService.getOnlineStudentCount();
    try {
        const dbTotal = await Student_js_1.Student.countDocuments();
        const dbOnline = await Student_js_1.Student.countDocuments({
            isOnline: true,
            lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
        });
        totalStudents = Math.max(totalStudents, dbTotal);
        onlineStudents = Math.max(onlineStudents, dbOnline);
    }
    catch (err) { }
    io.emit('METRICS_UPDATED', {
        totalStudents,
        onlineStudents,
        totalGames: 4,
        totalTokens: totalStudents
    });
};
exports.broadcastMetrics = broadcastMetrics;
const initializeSocketManager = (io) => {
    gameEngine_js_1.gameEngine.setSocketServer(io);
    io.on('connection', (socket) => {
        pino_js_1.logger.info({ socketId: socket.id }, 'New Socket.IO client connected');
        (0, exports.broadcastMetrics)(io).catch(() => { });
        socket.on('JOIN_EVENT_ROOM', async (data) => {
            const { eventId, studentId } = data;
            socket.join(`event:${eventId}`);
            socket.join('event:FRESHER2026'); // Also join global event code room
            pino_js_1.logger.info({ socketId: socket.id, eventId }, 'Client joined event room');
            if (studentId) {
                socket.data.studentId = studentId;
                Student_js_1.Student.findByIdAndUpdate(studentId, { isOnline: true, socketId: socket.id, lastActiveAt: new Date() })
                    .then(() => (0, exports.broadcastMetrics)(io))
                    .catch(() => { });
            }
            else {
                (0, exports.broadcastMetrics)(io).catch(() => { });
            }
        });
        socket.on('PING_HEARTBEAT', () => {
            if (socket.data.studentId) {
                Student_js_1.Student.findByIdAndUpdate(socket.data.studentId, { isOnline: true, lastActiveAt: new Date() }).catch(() => { });
            }
        });
        socket.on('JOIN_MANAGEMENT_ROOM', (data) => {
            const { eventId } = data;
            socket.join(`management:${eventId}`);
            socket.join('management:FRESHER2026');
            pino_js_1.logger.info({ socketId: socket.id, eventId }, 'Client joined management room');
            (0, exports.broadcastMetrics)(io).catch(() => { });
        });
        socket.on('JOIN_AUDITORIUM_ROOM', (data) => {
            const { eventId } = data;
            socket.join(`auditorium:${eventId}`);
            socket.join('auditorium:FRESHER2026');
            pino_js_1.logger.info({ socketId: socket.id, eventId }, 'Client joined auditorium room');
        });
        socket.on('disconnect', () => {
            pino_js_1.logger.info({ socketId: socket.id }, 'Socket.IO client disconnected');
            if (socket.data.studentId) {
                Student_js_1.Student.findByIdAndUpdate(socket.data.studentId, { isOnline: false, lastActiveAt: new Date() })
                    .then(() => (0, exports.broadcastMetrics)(io))
                    .catch(() => { });
            }
            else {
                (0, exports.broadcastMetrics)(io).catch(() => { });
            }
        });
    });
};
exports.initializeSocketManager = initializeSocketManager;
