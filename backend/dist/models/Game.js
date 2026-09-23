"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GameSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    type: {
        type: String,
        enum: ['SPEED_MCQ', 'SPOTLIGHT_CHALLENGE', 'LUCKY_NUMBER', 'AUDIENCE', 'PHYSICAL'],
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'READY', 'OPEN', 'LIVE', 'CLOSED', 'REVIEW', 'APPROVED', 'PUBLISHED'],
        default: 'DRAFT',
        index: true
    },
    timeLimit: { type: Number, default: 30 },
    prize: { type: Number, default: 50 },
    attemptRule: { type: String, enum: ['ONE_ATTEMPT', 'MULTIPLE_ATTEMPTS'], default: 'ONE_ATTEMPT' },
    winnerRule: { type: String, enum: ['FIRST_CORRECT', 'JUDGE_SCORE', 'MANUAL_SELECT'], default: 'FIRST_CORRECT' },
    description: { type: String },
    currentQuestionIndex: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 1 },
    selectedStudentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' },
    drawnNumber: { type: Number },
    drawnType: { type: String, enum: ['SPOTLIGHT', 'LUCKY'] }
}, { timestamps: true });
exports.Game = mongoose_1.default.model('Game', GameSchema);
