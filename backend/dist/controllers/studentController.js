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
        // 1. FAST PATH (Memory Cache): If student already logged in, reuse existing tokens & profile (< 1ms)
        const cachedStudent = cacheService_js_1.cacheService.getStudentByEnrollment(upperEnrollment);
        if (cachedStudent) {
            cachedStudent.name = cleanName;
            return res.json({
                success: true,
                data: {
                    studentId: cachedStudent.studentId,
                    name: cleanName,
                    enrollmentNo: cachedStudent.enrollmentNo,
                    tokenNo: cachedStudent.tokenNo,
                    luckyNo: cachedStudent.luckyNo,
                    spotlightNo: cachedStudent.spotlightNo,
                    sessionId: cachedStudent.sessionId || upperEnrollment
                }
            });
        }
        // 2. FAST DB LOOKUP: Check if student already exists in Database by enrollment number
        let existingDbStudent = null;
        try {
            existingDbStudent = await Promise.race([
                Student_js_1.Student.findOne({ enrollmentNo: upperEnrollment }),
                new Promise((res) => setTimeout(() => res(null), 200)) // 200ms timeout for fast response
            ]);
        }
        catch (err) { }
        // If existing student found in DB -> REUSE existing student record & tokens!
        if (existingDbStudent) {
            const studentData = {
                studentId: existingDbStudent._id.toString(),
                name: cleanName,
                enrollmentNo: existingDbStudent.enrollmentNo,
                tokenNo: existingDbStudent.tokenNo,
                luckyNo: existingDbStudent.luckyNo,
                spotlightNo: existingDbStudent.spotlightNo,
                sessionId: existingDbStudent.sessionId || crypto_1.default.randomUUID()
            };
            // Register in memory cache for instant future lookups
            cacheService_js_1.cacheService.registerStudentSession(studentData.sessionId, studentData);
            cacheService_js_1.cacheService.registerStudentSession(upperEnrollment, studentData);
            cacheService_js_1.cacheService.registerStudentSession(studentData.studentId, studentData);
            // Async background update for name & activity heartbeat
            Student_js_1.Student.findByIdAndUpdate(existingDbStudent._id, { name: cleanName, isOnline: true, lastActiveAt: new Date() }).catch(() => { });
            return res.json({
                success: true,
                data: studentData
            });
        }
        // 3. NEW STUDENT: Only generate new tokens if enrollment number does NOT exist in Cache or DB
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
        // Register in memory cache immediately
        cacheService_js_1.cacheService.registerStudentSession(sessionId, studentData);
        cacheService_js_1.cacheService.registerStudentSession(upperEnrollment, studentData);
        cacheService_js_1.cacheService.registerStudentSession(studentId, studentData);
        // Return instant response to user
        res.json({
            success: true,
            data: studentData
        });
        // Asynchronous background DB creation using upsert to guarantee uniqueness
        (async () => {
            try {
                await Student_js_1.Student.findOneAndUpdate({ enrollmentNo: upperEnrollment }, {
                    $setOnInsert: {
                        _id: studentId,
                        name: cleanName,
                        enrollmentNo: upperEnrollment,
                        tokenNo: tokens.tokenNo,
                        luckyNo: tokens.luckyNo,
                        spotlightNo: tokens.spotlightNo,
                        sessionId,
                        registeredAt: new Date()
                    },
                    $set: { lastActiveAt: new Date(), isOnline: true, name: cleanName }
                }, { upsert: true, new: true });
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
