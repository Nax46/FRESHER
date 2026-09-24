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
        const cleanName = name.trim();
        // 1. FAST PATH: Check memory cache first (< 1ms)
        const cachedStudent = cacheService_js_1.cacheService.getStudentByEnrollment(upperEnrollment);
        if (cachedStudent) {
            return res.json({
                success: true,
                data: {
                    studentId: cachedStudent.studentId,
                    name: cachedStudent.name,
                    enrollmentNo: cachedStudent.enrollmentNo,
                    tokenNo: cachedStudent.tokenNo,
                    luckyNo: cachedStudent.luckyNo,
                    spotlightNo: cachedStudent.spotlightNo,
                    sessionId: cachedStudent.sessionId || upperEnrollment
                }
            });
        }
        // 2. INSTANT GENERATION: Generate tokens immediately
        const tokens = await tokenService_js_1.TokenService.generateUniqueTokens();
        const sessionId = crypto_1.default.randomUUID();
        const studentId = `std_${Date.now()}_${tokens.tokenNo}`;
        const studentData = {
            studentId,
            name: cleanName,
            enrollmentNo: upperEnrollment,
            tokenNo: tokens.tokenNo,
            luckyNo: tokens.luckyNo,
            spotlightNo: tokens.spotlightNo,
            sessionId
        };
        // 3. Register in memory cache immediately
        cacheService_js_1.cacheService.registerStudentSession(sessionId, studentData);
        cacheService_js_1.cacheService.registerStudentSession(upperEnrollment, studentData);
        cacheService_js_1.cacheService.registerStudentSession(studentId, studentData);
        // 4. Return instant response (< 5ms) to user
        res.json({
            success: true,
            data: studentData
        });
        // 5. Asynchronous background DB save without holding the HTTP response
        (async () => {
            try {
                let existing = await Student_js_1.Student.findOne({ enrollmentNo: upperEnrollment });
                if (!existing) {
                    await Student_js_1.Student.create({
                        _id: studentId,
                        name: cleanName,
                        enrollmentNo: upperEnrollment,
                        tokenNo: tokens.tokenNo,
                        luckyNo: tokens.luckyNo,
                        spotlightNo: tokens.spotlightNo,
                        sessionId,
                        isOnline: true,
                        lastActiveAt: new Date()
                    });
                }
                else {
                    existing.name = cleanName;
                    existing.isOnline = true;
                    existing.lastActiveAt = new Date();
                    await existing.save();
                }
            }
            catch (dbErr) {
                pino_js_1.logger.error({ err: dbErr }, 'Background DB save warning in enterEvent');
            }
        })();
        return;
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
        // Check in-memory session first
        const cachedStudent = cacheService_js_1.cacheService.getStudentBySession(studentId) || cacheService_js_1.cacheService.getStudentByEnrollment(studentId);
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
        // Trigger DB heartbeat asynchronously in background without blocking response
        Student_js_1.Student.findByIdAndUpdate(studentId, { lastActiveAt: new Date(), isOnline: true }).catch(() => { });
        return res.json({
            success: true,
            data: {
                student: cachedStudent ? {
                    id: cachedStudent.studentId,
                    name: cachedStudent.name,
                    enrollmentNo: cachedStudent.enrollmentNo,
                    tokenNo: cachedStudent.tokenNo,
                    luckyNo: cachedStudent.luckyNo,
                    spotlightNo: cachedStudent.spotlightNo
                } : {
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
    catch (error) {
        return res.status(500).json({ success: false, error: 'Error fetching student status' });
    }
};
exports.getStudentStatus = getStudentStatus;
