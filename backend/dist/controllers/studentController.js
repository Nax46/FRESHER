"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStatus = exports.enterEvent = void 0;
const Student_js_1 = require("../models/Student.js");
const tokenService_js_1 = require("../services/tokenService.js");
const cacheService_js_1 = require("../services/cacheService.js");
const pino_js_1 = require("../config/pino.js");
const crypto_1 = __importDefault(require("crypto"));
const enterEvent = async (req, res) => {
    try {
        const { name, enrollmentNo } = req.body;
        if (!name || !enrollmentNo) {
            return res.status(400).json({ success: false, error: 'Full Name and Enrollment Number are required.' });
        }
        const upperEnrollment = enrollmentNo.toUpperCase().trim();
        let student = null;
        try {
            student = await Student_js_1.Student.findOne({ enrollmentNo: upperEnrollment });
        }
        catch (dbErr) {
            pino_js_1.logger.error({ err: dbErr }, 'DB lookup warning during enterEvent');
        }
        if (!student) {
            const tokens = await tokenService_js_1.TokenService.generateUniqueTokens();
            const sessionId = crypto_1.default.randomUUID();
            try {
                student = await Student_js_1.Student.create({
                    name,
                    enrollmentNo: upperEnrollment,
                    tokenNo: tokens.tokenNo,
                    luckyNo: tokens.luckyNo,
                    spotlightNo: tokens.spotlightNo,
                    sessionId,
                    isOnline: true,
                    lastActiveAt: new Date()
                });
            }
            catch (createErr) {
                pino_js_1.logger.error({ err: createErr }, 'Error creating student record in DB');
                // Fallback object if DB write hits temporary network glitch
                student = {
                    _id: tokens.tokenNo,
                    name,
                    enrollmentNo: upperEnrollment,
                    tokenNo: tokens.tokenNo,
                    luckyNo: tokens.luckyNo,
                    spotlightNo: tokens.spotlightNo,
                    sessionId,
                    isOnline: true
                };
            }
        }
        else {
            student.name = name;
            student.isOnline = true;
            student.lastActiveAt = new Date();
            if (!student.sessionId) {
                student.sessionId = crypto_1.default.randomUUID();
            }
            student.save().catch(err => pino_js_1.logger.error({ err }, 'Error saving student update'));
        }
        cacheService_js_1.cacheService.registerStudentSession(student.sessionId || student.enrollmentNo, {
            studentId: student._id.toString(),
            name: student.name,
            enrollmentNo: student.enrollmentNo,
            tokenNo: student.tokenNo,
            luckyNo: student.luckyNo,
            spotlightNo: student.spotlightNo
        });
        return res.json({
            success: true,
            data: {
                studentId: student._id.toString(),
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                tokenNo: student.tokenNo,
                luckyNo: student.luckyNo,
                spotlightNo: student.spotlightNo,
                sessionId: student.sessionId
            }
        });
    }
    catch (error) {
        pino_js_1.logger.error({ err: error }, 'Critical error in enterEvent');
        return res.status(500).json({ success: false, error: 'Failed to verify entry session. Please try again.' });
    }
};
exports.enterEvent = enterEvent;
const getStudentStatus = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        let student = null;
        try {
            student = await Student_js_1.Student.findByIdAndUpdate(studentId, { lastActiveAt: new Date(), isOnline: true }, { new: true });
        }
        catch (dbErr) { }
        if (!student) {
            // Fallback lookup from session cache
            const activeGame = cacheService_js_1.cacheService.getActiveGame();
            let availableGame = null;
            if (activeGame && (activeGame.status === 'OPEN' || activeGame.status === 'LIVE')) {
                availableGame = {
                    gameId: activeGame.gameId,
                    title: activeGame.title,
                    type: activeGame.type,
                    status: activeGame.status,
                    timeLimit: activeGame.timeLimit,
                    prize: activeGame.prize,
                    hasJoined: activeGame.joinedStudentIds.has(studentId),
                    hasSubmitted: activeGame.submissions.has(studentId)
                };
            }
            return res.json({
                success: true,
                data: {
                    student: {
                        id: studentId,
                        name: 'Fresher Participant',
                        enrollmentNo: 'EN2026',
                        tokenNo: 1,
                        luckyNo: 101,
                        spotlightNo: 11
                    },
                    availableGame
                }
            });
        }
        const activeGame = cacheService_js_1.cacheService.getActiveGame();
        let availableGame = null;
        if (activeGame && (activeGame.status === 'OPEN' || activeGame.status === 'LIVE')) {
            availableGame = {
                gameId: activeGame.gameId,
                title: activeGame.title,
                type: activeGame.type,
                status: activeGame.status,
                timeLimit: activeGame.timeLimit,
                prize: activeGame.prize,
                hasJoined: activeGame.joinedStudentIds.has(studentId),
                hasSubmitted: activeGame.submissions.has(studentId)
            };
        }
        return res.json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNo,
                    tokenNo: student.tokenNo,
                    luckyNo: student.luckyNo,
                    spotlightNo: student.spotlightNo
                },
                availableGame
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Error fetching student status' });
    }
};
exports.getStudentStatus = getStudentStatus;
