"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEngine = exports.GameEngine = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cacheService_js_1 = require("./cacheService.js");
const Game_js_1 = require("../models/Game.js");
const Question_js_1 = require("../models/Question.js");
const Participant_js_1 = require("../models/Participant.js");
const Submission_js_1 = require("../models/Submission.js");
const Winner_js_1 = require("../models/Winner.js");
const Student_js_1 = require("../models/Student.js");
const Event_js_1 = require("../models/Event.js");
const pino_js_1 = require("../config/pino.js");
class GameEngine {
    io = null;
    timerId = null;
    setSocketServer(io) {
        this.io = io;
    }
    async openGame(gameId, eventId) {
        let game = null;
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(gameId)) {
                game = await Game_js_1.Game.findById(gameId);
            }
            else {
                game = await Game_js_1.Game.findOne({ _id: gameId });
            }
        }
        catch (err) { }
        if (!game) {
            try {
                game = await Game_js_1.Game.findOne({ title: { $regex: gameId.replace(/^game_/, '').replace(/_\d+$/, ''), $options: 'i' } });
            }
            catch (err) { }
        }
        if (!game) {
            // Fallback default games mapping
            const defaultGamesList = [
                {
                    _id: 'game_emoji_01',
                    title: '😂 Guess the Emoji',
                    type: 'SPEED_MCQ',
                    timeLimit: 30,
                    prize: 50,
                    questions: [
                        { id: 'q1', questionText: 'What movie does this represent?', mediaContent: '🦁 + 👑', options: ['Jungle Book', 'Lion King', 'Madagascar', 'Simba'], correctOptionIndex: 1, order: 1 },
                        { id: 'q2', questionText: 'Which blockbuster movie is this?', mediaContent: '🕷️ + 👨', options: ['Batman', 'Iron Man', 'Spider-Man', 'Superman'], correctOptionIndex: 2, order: 2 },
                        { id: 'q3', questionText: 'Guess the iconic movie title!', mediaContent: '🚢 + ❄️ + 🧊', options: ['Titanic', 'Avatar', 'Pirates of Caribbean', 'Life of Pi'], correctOptionIndex: 0, order: 3 }
                    ]
                },
                {
                    _id: 'game_lyrics_02',
                    title: '🎵 Finish the Lyrics',
                    type: 'SPEED_MCQ',
                    timeLimit: 30,
                    prize: 50,
                    questions: [
                        { id: 'q1', questionText: 'Complete the lyric: "Apna Time _____!"', mediaContent: '🎤 "Apna Time _____!"', options: ['Kab Aayega', 'Aayega', 'Aa Gaya', 'Hoga'], correctOptionIndex: 1, order: 1 },
                        { id: 'q2', questionText: 'Complete the line: "Tum hi ho, ab tum hi ho..."', mediaContent: '🎵 "Tum hi ho..."', options: ['Meri Tum', 'Ab Tum Hi Ho', 'Bas Tum Hi', 'Har Pal Tum'], correctOptionIndex: 1, order: 2 }
                    ]
                },
                {
                    _id: 'game_quote_03',
                    title: '👀 Who Said This?',
                    type: 'SPEED_MCQ',
                    timeLimit: 20,
                    prize: 50,
                    questions: [
                        { id: 'q1', questionText: 'Who said: "Mogambo Khush Hua!"?', mediaContent: '💬 "Mogambo Khush Hua!"', options: ['Gabbar Singh', 'Crime Master Gogo', 'Mogambo', 'Shakal'], correctOptionIndex: 2, order: 1 }
                    ]
                },
                {
                    _id: 'game_dialogue_04',
                    title: '🎬 Complete the Dialogue',
                    type: 'SPOTLIGHT_CHALLENGE',
                    timeLimit: 60,
                    prize: 100,
                    questions: [
                        { id: 'q1', questionText: 'Complete this famous dialogue on stage!', mediaContent: '🎭 "Mogambo..."', options: ['Pass', 'Fail'], correctOptionIndex: 0, order: 1 }
                    ]
                },
                {
                    _id: 'game_memory_05',
                    title: '🧠 Memory Challenge',
                    type: 'SPOTLIGHT_CHALLENGE',
                    timeLimit: 60,
                    prize: 100,
                    questions: [
                        { id: 'q1', questionText: 'Recall the sequence shown on screen!', mediaContent: '🍎 🚗 🎸 🐱 ⚽', options: ['Correct 8+', 'Correct <8'], correctOptionIndex: 0, order: 1 }
                    ]
                },
                {
                    _id: 'game_faculty_06',
                    title: '🎯 Faculty 1v1',
                    type: 'LUCKY_NUMBER',
                    timeLimit: 120,
                    prize: 200,
                    questions: [
                        { id: 'q1', questionText: 'Student vs Faculty Showdown!', mediaContent: '🏆 Stage Challenge', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 1 }
                    ]
                },
                {
                    _id: 'game_audience_07',
                    title: '🙈 Never Have I Ever',
                    type: 'AUDIENCE',
                    timeLimit: 60,
                    prize: 0,
                    questions: [
                        { id: 'q1', questionText: 'Never Have I Ever slept in a lecture!', mediaContent: '🙈 Audience Poll', options: ['I Have', 'I Never'], correctOptionIndex: 0, order: 1 }
                    ]
                },
                {
                    _id: 'game_physical_08',
                    title: '⚡ 30-Second Challenge',
                    type: 'PHYSICAL',
                    timeLimit: 30,
                    prize: 50,
                    questions: [
                        { id: 'q1', questionText: 'Rapid-fire 30-second physical challenge!', mediaContent: '⚡ 30 Seconds', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 1 }
                    ]
                }
            ];
            const found = defaultGamesList.find(g => g._id === gameId) || defaultGamesList[0];
            game = {
                _id: found._id,
                title: found.title,
                type: found.type,
                timeLimit: found.timeLimit,
                prize: found.prize,
                status: 'OPEN',
                save: async () => { }
            };
        }
        let dbQuestions = [];
        try {
            dbQuestions = await Question_js_1.Question.find({ gameId }).sort({ order: 1 });
        }
        catch (err) { }
        let questionsList = dbQuestions.map(q => ({
            id: q._id.toString(),
            questionText: q.questionText,
            mediaContent: q.mediaContent,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            order: q.order
        }));
        if (questionsList.length === 0) {
            // Default questions fallback
            questionsList = [
                { id: 'q1', questionText: 'What movie does this represent?', mediaContent: '🦁 + 👑', options: ['Jungle Book', 'Lion King', 'Madagascar', 'Simba'], correctOptionIndex: 1, order: 1 },
                { id: 'q2', questionText: 'Which blockbuster movie is this?', mediaContent: '🕷️ + 👨', options: ['Batman', 'Iron Man', 'Spider-Man', 'Superman'], correctOptionIndex: 2, order: 2 },
                { id: 'q3', questionText: 'Guess the iconic movie title!', mediaContent: '🚢 + ❄️ + 🧊', options: ['Titanic', 'Avatar', 'Pirates of Caribbean', 'Life of Pi'], correctOptionIndex: 0, order: 3 }
            ];
        }
        const activeState = {
            gameId: game._id.toString(),
            title: game.title,
            type: game.type,
            status: 'OPEN',
            timeLimit: game.timeLimit || 30,
            prize: game.prize || 50,
            questions: questionsList,
            currentQuestionIndex: 0,
            totalQuestions: questionsList.length || 1,
            joinedStudentIds: new Set(),
            submissions: new Map()
        };
        game.status = 'OPEN';
        game.currentQuestionIndex = 0;
        game.totalQuestions = questionsList.length || 1;
        try {
            await game.save();
        }
        catch (err) { }
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(eventId)) {
                await Event_js_1.EventModel.findByIdAndUpdate(eventId, { currentGameId: game._id });
            }
            else {
                await Event_js_1.EventModel.findOneAndUpdate({ code: eventId }, { currentGameId: game._id });
            }
        }
        catch (err) { }
        cacheService_js_1.cacheService.setActiveGame(activeState);
        const currentQ = questionsList[0];
        if (this.io) {
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_OPENED', {
                gameId: activeState.gameId,
                title: activeState.title,
                type: activeState.type,
                timeLimit: activeState.timeLimit,
                prize: activeState.prize,
                currentQuestionIndex: 0,
                totalQuestions: activeState.totalQuestions,
                questionPreview: currentQ ? {
                    questionText: currentQ.questionText,
                    mediaContent: currentQ.mediaContent
                } : null
            });
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'GAME_ANNOUNCEMENT',
                payload: {
                    gameTitle: activeState.title,
                    gameType: activeState.type,
                    prize: activeState.prize,
                    totalQuestions: activeState.totalQuestions
                }
            });
        }
        pino_js_1.logger.info(`Game ${game.title} is now OPEN (${questionsList.length} questions).`);
        return activeState;
    }
    async joinGame(gameId, studentId, eventId) {
        const active = cacheService_js_1.cacheService.getActiveGame();
        if (!active) {
            throw new Error('No game is currently open for joining');
        }
        if (active.status !== 'OPEN' && active.status !== 'LIVE') {
            throw new Error('Game joining is currently closed');
        }
        active.joinedStudentIds.add(studentId);
        Participant_js_1.Participant.updateOne({ gameId: active.gameId, studentId }, { $setOnInsert: { joinedAt: new Date(), status: 'JOINED' } }, { upsert: true }).catch(err => pino_js_1.logger.error({ err }, 'Failed to persist participant'));
        const joinedCount = active.joinedStudentIds.size;
        if (this.io) {
            this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('PARTICIPANT_JOINED', {
                gameId,
                studentId,
                joinedCount
            });
        }
        return { joinedCount };
    }
    async startGame(gameId, eventId) {
        const active = cacheService_js_1.cacheService.getActiveGame();
        if (!active || active.gameId !== gameId) {
            throw new Error('Active game state mismatch');
        }
        active.status = 'LIVE';
        active.startTime = Date.now();
        active.winnerCandidateId = undefined;
        active.winnerCandidateResponseTime = undefined;
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(gameId)) {
                await Game_js_1.Game.findByIdAndUpdate(gameId, { status: 'LIVE', currentQuestionIndex: active.currentQuestionIndex });
            }
        }
        catch (err) { }
        const currentQ = active.questions[active.currentQuestionIndex];
        if (this.io) {
            const publicQuestion = currentQ ? {
                id: currentQ.id,
                questionText: currentQ.questionText,
                mediaContent: currentQ.mediaContent,
                options: currentQ.options,
                order: currentQ.order
            } : null;
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_STARTED', {
                gameId: active.gameId,
                timeLimit: active.timeLimit,
                currentQuestionIndex: active.currentQuestionIndex,
                totalQuestions: active.totalQuestions,
                question: publicQuestion,
                startTime: active.startTime
            });
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'GAME_LIVE',
                payload: {
                    gameTitle: active.title,
                    question: publicQuestion,
                    timeLimit: active.timeLimit,
                    currentQuestionIndex: active.currentQuestionIndex + 1,
                    totalQuestions: active.totalQuestions
                }
            });
        }
        if (this.timerId)
            clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.closeGame(gameId, eventId).catch(err => pino_js_1.logger.error({ err }, 'Error auto closing game'));
        }, (active.timeLimit + 2) * 1000);
        pino_js_1.logger.info(`Game ${active.title} is now LIVE (Question ${active.currentQuestionIndex + 1}/${active.totalQuestions}).`);
        return active;
    }
    // ADMIN NEXT QUESTION CONTROL
    async nextQuestion(gameId, eventId) {
        const active = cacheService_js_1.cacheService.getActiveGame();
        if (!active || active.gameId !== gameId) {
            throw new Error('Active game state mismatch');
        }
        if (active.currentQuestionIndex + 1 >= active.questions.length) {
            throw new Error('No more questions remaining in this game');
        }
        active.currentQuestionIndex += 1;
        active.status = 'LIVE';
        active.startTime = Date.now();
        active.winnerCandidateId = undefined;
        active.winnerCandidateResponseTime = undefined;
        active.submissions.clear(); // Reset submissions for the new question
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(gameId)) {
                await Game_js_1.Game.findByIdAndUpdate(gameId, {
                    status: 'LIVE',
                    currentQuestionIndex: active.currentQuestionIndex
                });
            }
        }
        catch (err) { }
        const currentQ = active.questions[active.currentQuestionIndex];
        if (this.io) {
            const publicQuestion = currentQ ? {
                id: currentQ.id,
                questionText: currentQ.questionText,
                mediaContent: currentQ.mediaContent,
                options: currentQ.options,
                order: currentQ.order
            } : null;
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('QUESTION_CHANGED', {
                gameId: active.gameId,
                timeLimit: active.timeLimit,
                currentQuestionIndex: active.currentQuestionIndex,
                totalQuestions: active.totalQuestions,
                question: publicQuestion,
                startTime: active.startTime
            });
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'GAME_LIVE',
                payload: {
                    gameTitle: active.title,
                    question: publicQuestion,
                    timeLimit: active.timeLimit,
                    currentQuestionIndex: active.currentQuestionIndex + 1,
                    totalQuestions: active.totalQuestions
                }
            });
        }
        if (this.timerId)
            clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.closeGame(gameId, eventId).catch(err => pino_js_1.logger.error({ err }, 'Error auto closing question'));
        }, (active.timeLimit + 2) * 1000);
        pino_js_1.logger.info(`Management released NEXT QUESTION (${active.currentQuestionIndex + 1}/${active.totalQuestions}) for ${active.title}`);
        return active;
    }
    submitAnswer(gameId, studentId, selectedOptionIndex) {
        const active = cacheService_js_1.cacheService.getActiveGame();
        if (!active || active.gameId !== gameId) {
            throw new Error('Game is not active');
        }
        if (active.status !== 'LIVE' || !active.startTime) {
            throw new Error('Game is not accepting submissions');
        }
        if (active.submissions.has(studentId)) {
            throw new Error('You have already submitted an answer for this question');
        }
        const now = Date.now();
        const responseTimeMs = now - active.startTime;
        const currentQ = active.questions[active.currentQuestionIndex];
        const isCorrect = currentQ ? (selectedOptionIndex === currentQ.correctOptionIndex) : false;
        let isWinnerCandidate = false;
        // ATOMIC WINNER CANDIDATE LOCK
        if (isCorrect && !active.winnerCandidateId) {
            active.winnerCandidateId = studentId;
            active.winnerCandidateResponseTime = responseTimeMs;
            isWinnerCandidate = true;
            pino_js_1.logger.info({ studentId, responseTimeMs }, '⚡ WINNER CANDIDATE CAPTURED IN MEMORY!');
        }
        active.submissions.set(studentId, {
            selectedOptionIndex,
            isCorrect,
            responseTimeMs,
            timestamp: new Date(),
            questionIndex: active.currentQuestionIndex
        });
        if (currentQ) {
            Submission_js_1.Submission.create({
                gameId,
                questionId: currentQ.id,
                studentId,
                selectedOptionIndex,
                isCorrect,
                responseTimeMs,
                serverTimestamp: new Date()
            }).catch(err => pino_js_1.logger.error({ err }, 'Error persisting submission'));
        }
        if (this.io) {
            this.io.to(`management:${active.gameId}`).to('management:FRESHER2026').emit('SUBMISSION_RECEIVED', {
                totalSubmissions: active.submissions.size,
                correctCount: Array.from(active.submissions.values()).filter(s => s.isCorrect).length
            });
        }
        return { isCorrect, responseTimeMs, isWinnerCandidate };
    }
    async closeGame(gameId, eventId) {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        const active = cacheService_js_1.cacheService.getActiveGame();
        if (!active || active.gameId !== gameId) {
            const g = await Game_js_1.Game.findById(gameId);
            if (g) {
                g.status = 'CLOSED';
                await g.save();
            }
            return { winnerCandidate: null, totalSubmissions: 0 };
        }
        active.status = 'CLOSED';
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(gameId)) {
                await Game_js_1.Game.findByIdAndUpdate(gameId, { status: 'CLOSED' });
            }
        }
        catch (err) { }
        let winnerCandidateData = null;
        if (active.winnerCandidateId) {
            const student = await Student_js_1.Student.findById(active.winnerCandidateId);
            if (student) {
                const currentQ = active.questions[active.currentQuestionIndex];
                const winner = await Winner_js_1.Winner.create({
                    gameId,
                    studentId: student._id,
                    status: 'CANDIDATE',
                    prizeAmount: active.prize,
                    responseTimeMs: active.winnerCandidateResponseTime,
                    selectedAnswerText: currentQ?.options[currentQ.correctOptionIndex]
                });
                winnerCandidateData = {
                    winnerId: winner._id,
                    studentId: student._id,
                    name: student.name,
                    tokenNo: student.tokenNo,
                    enrollmentNo: student.enrollmentNo,
                    responseTimeMs: active.winnerCandidateResponseTime,
                    correctAnswer: currentQ?.options[currentQ.correctOptionIndex]
                };
            }
        }
        if (this.io) {
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_CLOSED', { gameId });
            this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('WINNER_CANDIDATE', {
                gameId,
                winnerCandidate: winnerCandidateData,
                totalSubmissions: active.submissions.size
            });
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'GAME_CLOSED',
                payload: {
                    gameTitle: active.title
                }
            });
        }
        pino_js_1.logger.info(`Game ${active.title} closed. Candidate winner: ${winnerCandidateData ? winnerCandidateData.name : 'None'}`);
        return { winnerCandidate: winnerCandidateData, totalSubmissions: active.submissions.size };
    }
    async approveWinner(winnerId, approvedBy, eventId) {
        const winner = await Winner_js_1.Winner.findById(winnerId).populate('studentId gameId');
        if (!winner)
            throw new Error('Winner record not found');
        winner.status = 'APPROVED';
        winner.approvedBy = approvedBy;
        winner.approvedAt = new Date();
        await winner.save();
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(winner.gameId?._id ? winner.gameId._id.toString() : winner.gameId?.toString())) {
                await Game_js_1.Game.findByIdAndUpdate(winner.gameId, { status: 'APPROVED' });
            }
        }
        catch (err) { }
        const student = winner.studentId;
        const game = winner.gameId;
        const auditPayload = {
            gameTitle: game ? game.title : 'Fresher Challenge',
            winnerName: student ? student.name : 'Winner Student',
            tokenNo: student ? student.tokenNo : 0,
            prize: winner.prizeAmount || 50,
            responseTimeMs: winner.responseTimeMs
        };
        try {
            await Event_js_1.EventModel.findOneAndUpdate({ code: 'FRESHER2026' }, {
                auditoriumState: {
                    state: 'WINNER_PUBLISHED',
                    payload: auditPayload,
                    updatedAt: new Date()
                }
            });
        }
        catch (err) { }
        if (this.io) {
            this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('WINNER_APPROVED', {
                winnerId: winner._id,
                studentName: student ? student.name : 'Winner',
                tokenNo: student ? student.tokenNo : 0,
                gameTitle: game ? game.title : ''
            });
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'WINNER_PUBLISHED',
                payload: auditPayload
            });
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('WINNER_PUBLISHED', {
                gameTitle: game ? game.title : 'Fresher Challenge',
                winnerName: student ? student.name : 'Winner Student',
                tokenNo: student ? student.tokenNo : 0
            });
        }
        return winner;
    }
    async publishWinner(winnerId, eventId) {
        const winner = await Winner_js_1.Winner.findById(winnerId).populate('studentId gameId');
        if (!winner)
            throw new Error('Winner record not found');
        winner.status = 'PUBLISHED';
        winner.publishedAt = new Date();
        await winner.save();
        await Game_js_1.Game.findByIdAndUpdate(winner.gameId, { status: 'PUBLISHED' });
        const student = winner.studentId;
        const game = winner.gameId;
        if (this.io) {
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: 'WINNER_PUBLISHED',
                payload: {
                    gameTitle: game.title,
                    winnerName: student.name,
                    tokenNo: student.tokenNo,
                    prize: winner.prizeAmount
                }
            });
            this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('WINNER_PUBLISHED', {
                gameTitle: game.title,
                winnerName: student.name,
                tokenNo: student.tokenNo
            });
        }
        pino_js_1.logger.info(`Published winner ${student.name} for game ${game.title} to Auditorium!`);
        return winner;
    }
    // DRAW RANDOM NUMBER (FILTERED STRICTLY TO REGISTERED ENTERED STUDENTS ONLY!)
    async drawRandomNumber(type, eventId) {
        // Query MongoDB ONLY for students who actually registered & entered the event
        let students = await Student_js_1.Student.find({ isOnline: true }).select('name enrollmentNo tokenNo luckyNo spotlightNo');
        if (!students || students.length === 0) {
            // Fall back to all registered students in DB
            students = await Student_js_1.Student.find({}).select('name enrollmentNo tokenNo luckyNo spotlightNo');
        }
        if (!students || students.length === 0) {
            throw new Error('No students have entered the event arena yet. Ask students to scan QR code!');
        }
        const randomIndex = Math.floor(Math.random() * students.length);
        const selectedStudent = students[randomIndex];
        const drawnNumber = type === 'SPOTLIGHT' ? selectedStudent.spotlightNo : selectedStudent.luckyNo;
        if (this.io) {
            this.io.to(`auditorium:${eventId}`).to('auditorium:FRESHER2026').emit('AUDITORIUM_UPDATED', {
                state: type === 'SPOTLIGHT' ? 'SPOTLIGHT_DRAW' : 'LUCKY_DRAW',
                payload: {
                    number: drawnNumber,
                    studentName: selectedStudent.name,
                    tokenNo: selectedStudent.tokenNo,
                    type
                }
            });
            this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('NUMBER_DRAWN', {
                type,
                number: drawnNumber,
                student: selectedStudent,
                registeredCount: students.length
            });
        }
        return { number: drawnNumber, student: selectedStudent, registeredCount: students.length };
    }
}
exports.GameEngine = GameEngine;
exports.gameEngine = new GameEngine();
