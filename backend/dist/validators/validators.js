"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAuditoriumSchema = exports.adminLoginSchema = exports.submitAnswerSchema = exports.enterEventSchema = void 0;
const zod_1 = require("zod");
exports.enterEventSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50),
    enrollmentNo: zod_1.z.string().min(4, 'Enrollment number required').max(30)
});
exports.submitAnswerSchema = zod_1.z.object({
    gameId: zod_1.z.string(),
    selectedOptionIndex: zod_1.z.number().int().min(0).max(10),
    studentId: zod_1.z.string()
});
exports.adminLoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
});
exports.updateAuditoriumSchema = zod_1.z.object({
    state: zod_1.z.enum(['WELCOME', 'WAITING', 'GAME_ANNOUNCEMENT', 'COUNTDOWN', 'GAME_LIVE', 'GAME_CLOSED', 'WINNER_PUBLISHED', 'SPOTLIGHT_DRAW', 'LUCKY_DRAW', 'NEXT_GAME']),
    payload: zod_1.z.record(zod_1.z.any()).optional()
});
