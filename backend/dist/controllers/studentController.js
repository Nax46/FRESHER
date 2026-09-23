"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStatus = exports.enterEvent = void 0;
const Student_js_1 = require("../models/Student.js");
const tokenService_js_1 = require("../services/tokenService.js");
const cacheService_js_1 = require("../services/cacheService.js");
const crypto_1 = __importDefault(require("crypto"));
const enterEvent = async (req, res) => {
    const { name, enrollmentNo } = req.body;
    const upperEnrollment = enrollmentNo.toUpperCase().trim();
    let student = await Student_js_1.Student.findOne({ enrollmentNo: upperEnrollment });
    if (!student) {
        // Generate new unique physical fresher token tuple
        const tokens = await tokenService_js_1.TokenService.generateUniqueTokens();
        const sessionId = crypto_1.default.randomUUID();
        student = await Student_js_1.Student.create({
            name,
            enrollmentNo: upperEnrollment,
            tokenNo: tokens.tokenNo,
            luckyNo: tokens.luckyNo,
            spotlightNo: tokens.spotlightNo,
            sessionId,
            isOnline: true
        });
    }
    else {
        // Re-use existing student session
        student.name = name;
        student.isOnline = true;
        student.lastActiveAt = new Date();
        if (!student.sessionId) {
            student.sessionId = crypto_1.default.randomUUID();
        }
        await student.save();
    }
    cacheService_js_1.cacheService.registerStudentSession(student.sessionId, {
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
            studentId: student._id,
            name: student.name,
            enrollmentNo: student.enrollmentNo,
            tokenNo: student.tokenNo,
            luckyNo: student.luckyNo,
            spotlightNo: student.spotlightNo,
            sessionId: student.sessionId
        }
    });
};
exports.enterEvent = enterEvent;
const getStudentStatus = async (req, res) => {
    const studentId = req.params.studentId;
    const student = await Student_js_1.Student.findByIdAndUpdate(studentId, { lastActiveAt: new Date(), isOnline: true }, { new: true });
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student profile not found' });
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
};
exports.getStudentStatus = getStudentStatus;
