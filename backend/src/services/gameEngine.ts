import mongoose from 'mongoose';
import { cacheService, ActiveGameState, QuestionItem } from './cacheService.js';
import { Game } from '../models/Game.js';
import { Question } from '../models/Question.js';
import { Participant } from '../models/Participant.js';
import { Submission } from '../models/Submission.js';
import { Winner } from '../models/Winner.js';
import { Student } from '../models/Student.js';
import { EventModel } from '../models/Event.js';
import { logger } from '../config/pino.js';
import { Server as SocketServer } from 'socket.io';

export class GameEngine {
  private io: SocketServer | null = null;
  private timerId: NodeJS.Timeout | null = null;

  public setSocketServer(io: SocketServer) {
    this.io = io;
  }

  public async openGame(gameId: string, eventId: string): Promise<ActiveGameState> {
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
      }
    ];

    const foundDefault = defaultGamesList.find(g => g._id === gameId) || defaultGamesList[0];

    let questionsList: QuestionItem[] = foundDefault.questions;

    const activeState: ActiveGameState = {
      gameId: foundDefault._id,
      title: foundDefault.title,
      type: foundDefault.type,
      status: 'OPEN',
      timeLimit: foundDefault.timeLimit,
      prize: foundDefault.prize,
      questions: questionsList,
      currentQuestionIndex: 0,
      totalQuestions: questionsList.length,
      joinedStudentIds: new Set(),
      submissions: new Map()
    };

    // 1. Instant Cache Update (< 1ms)
    cacheService.setActiveGame(activeState);

    // 2. Instant Socket Broadcast (< 1ms)
    if (this.io) {
      const currentQ = questionsList[0];
      const openPayload = {
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
      };

      this.io.emit('GAME_OPENED', openPayload);
      this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_OPENED', openPayload);

      this.io.emit('AUDITORIUM_UPDATED', {
        state: 'GAME_ANNOUNCEMENT',
        payload: {
          gameTitle: activeState.title,
          gameType: activeState.type,
          prize: activeState.prize,
          totalQuestions: activeState.totalQuestions
        }
      });
    }

    // 3. Async Background DB sync without delaying response
    (async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          let dbQuestions = await Question.find({ gameId }).sort({ order: 1 });
          if (dbQuestions && dbQuestions.length > 0) {
            activeState.questions = dbQuestions.map(q => ({
              id: q._id.toString(),
              questionText: q.questionText,
              mediaContent: q.mediaContent,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              order: q.order
            }));
            activeState.totalQuestions = activeState.questions.length;
          }
          await Game.findOneAndUpdate({ _id: gameId }, { status: 'OPEN', currentQuestionIndex: 0 }, { upsert: true });
        }
      } catch (dbErr) {
        logger.error({ err: dbErr }, 'Background DB sync warning in openGame');
      }
    })();

    logger.info(`Game ${activeState.title} is now OPEN (${activeState.totalQuestions} questions).`);
    return activeState;
  }

  public async joinGame(gameId: string, studentId: string, eventId: string): Promise<{ joinedCount: number }> {
    const active = cacheService.getActiveGame();
    if (!active) {
      throw new Error('No game is currently open for joining');
    }
    if (active.status !== 'OPEN' && active.status !== 'LIVE') {
      throw new Error('Game joining is currently closed');
    }

    active.joinedStudentIds.add(studentId);

    Participant.updateOne(
      { gameId: active.gameId, studentId },
      { $setOnInsert: { joinedAt: new Date(), status: 'JOINED' } },
      { upsert: true }
    ).catch(err => logger.error({ err }, 'Failed to persist participant'));

    const joinedCount = active.joinedStudentIds.size;

    if (this.io) {
      this.io.emit('PARTICIPANT_JOINED', {
        gameId,
        studentId,
        joinedCount
      });
      this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('PARTICIPANT_JOINED', {
        gameId,
        studentId,
        joinedCount
      });
    }

    return { joinedCount };
  }

  public async startGame(gameId: string, eventId: string): Promise<ActiveGameState> {
    const active = cacheService.getActiveGame();
    if (!active || active.gameId !== gameId) {
      throw new Error('Active game state mismatch');
    }

    active.status = 'LIVE';
    active.startTime = Date.now();
    active.winnerCandidateId = undefined;
    active.winnerCandidateResponseTime = undefined;

    try {
      if (mongoose.Types.ObjectId.isValid(gameId)) {
        await Game.findByIdAndUpdate(gameId, { status: 'LIVE', currentQuestionIndex: active.currentQuestionIndex });
      }
    } catch (err) {}

    const currentQ = active.questions[active.currentQuestionIndex];

    if (this.io) {
      const publicQuestion = currentQ ? {
        id: currentQ.id,
        questionText: currentQ.questionText,
        mediaContent: currentQ.mediaContent,
        options: currentQ.options,
        order: currentQ.order
      } : null;

      const startPayload = {
        gameId: active.gameId,
        timeLimit: active.timeLimit,
        currentQuestionIndex: active.currentQuestionIndex,
        totalQuestions: active.totalQuestions,
        question: publicQuestion,
        startTime: active.startTime
      };

      this.io.emit('GAME_STARTED', startPayload);
      this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_STARTED', startPayload);

      this.io.emit('AUDITORIUM_UPDATED', {
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

    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.closeGame(gameId, eventId).catch(err => logger.error({ err }, 'Error auto closing game'));
    }, (active.timeLimit + 2) * 1000);

    logger.info(`Game ${active.title} is now LIVE (Question ${active.currentQuestionIndex + 1}/${active.totalQuestions}).`);
    return active;
  }

  // ADMIN NEXT QUESTION CONTROL
  public async nextQuestion(gameId: string, eventId: string): Promise<ActiveGameState> {
    const active = cacheService.getActiveGame();
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
      if (mongoose.Types.ObjectId.isValid(gameId)) {
        await Game.findByIdAndUpdate(gameId, {
          status: 'LIVE',
          currentQuestionIndex: active.currentQuestionIndex
        });
      }
    } catch (err) {}

    const currentQ = active.questions[active.currentQuestionIndex];

    if (this.io) {
      const publicQuestion = currentQ ? {
        id: currentQ.id,
        questionText: currentQ.questionText,
        mediaContent: currentQ.mediaContent,
        options: currentQ.options,
        order: currentQ.order
      } : null;

      const nextPayload = {
        gameId: active.gameId,
        timeLimit: active.timeLimit,
        currentQuestionIndex: active.currentQuestionIndex,
        totalQuestions: active.totalQuestions,
        question: publicQuestion,
        startTime: active.startTime
      };

      this.io.emit('QUESTION_CHANGED', nextPayload);
      this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('QUESTION_CHANGED', nextPayload);

      this.io.emit('AUDITORIUM_UPDATED', {
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

    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.closeGame(gameId, eventId).catch(err => logger.error({ err }, 'Error auto closing question'));
    }, (active.timeLimit + 2) * 1000);

    logger.info(`Management released NEXT QUESTION (${active.currentQuestionIndex + 1}/${active.totalQuestions}) for ${active.title}`);
    return active;
  }

  public submitAnswer(gameId: string, studentId: string, selectedOptionIndex: number): { isCorrect: boolean; responseTimeMs: number; isWinnerCandidate: boolean } {
    const active = cacheService.getActiveGame();
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
      logger.info({ studentId, responseTimeMs }, '⚡ WINNER CANDIDATE CAPTURED IN MEMORY!');
    }

    active.submissions.set(studentId, {
      selectedOptionIndex,
      isCorrect,
      responseTimeMs,
      timestamp: new Date(),
      questionIndex: active.currentQuestionIndex
    });

    if (currentQ) {
      Submission.create({
        gameId,
        questionId: currentQ.id,
        studentId,
        selectedOptionIndex,
        isCorrect,
        responseTimeMs,
        serverTimestamp: new Date()
      }).catch(err => logger.error({ err }, 'Error persisting submission'));
    }

    if (this.io) {
      const subPayload = {
        totalSubmissions: active.submissions.size,
        correctCount: Array.from(active.submissions.values()).filter(s => s.isCorrect).length
      };
      this.io.emit('SUBMISSION_RECEIVED', subPayload);
      this.io.to(`management:${active.gameId}`).to('management:FRESHER2026').emit('SUBMISSION_RECEIVED', subPayload);
    }

    return { isCorrect, responseTimeMs, isWinnerCandidate };
  }

  public async closeGame(gameId: string, eventId: string): Promise<{ winnerCandidate: any; totalSubmissions: number }> {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    const active = cacheService.getActiveGame();
    if (!active || active.gameId !== gameId) {
      const g = await Game.findById(gameId);
      if (g) {
        g.status = 'CLOSED';
        await g.save();
      }
      return { winnerCandidate: null, totalSubmissions: 0 };
    }

    active.status = 'CLOSED';
    try {
      if (mongoose.Types.ObjectId.isValid(gameId)) {
        await Game.findByIdAndUpdate(gameId, { status: 'CLOSED' });
      }
    } catch (err) {}

    let winnerCandidateData: any = null;

    if (active.winnerCandidateId) {
      const student = await Student.findById(active.winnerCandidateId);
      if (student) {
        const currentQ = active.questions[active.currentQuestionIndex];
        const winner = await Winner.create({
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
      this.io.emit('GAME_CLOSED', { gameId });
      this.io.to(`event:${eventId}`).to('event:FRESHER2026').emit('GAME_CLOSED', { gameId });

      this.io.emit('WINNER_CANDIDATE', {
        gameId,
        winnerCandidate: winnerCandidateData,
        totalSubmissions: active.submissions.size
      });
      this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('WINNER_CANDIDATE', {
        gameId,
        winnerCandidate: winnerCandidateData,
        totalSubmissions: active.submissions.size
      });

      this.io.emit('AUDITORIUM_UPDATED', {
        state: 'GAME_CLOSED',
        payload: {
          gameTitle: active.title
        }
      });
    }

    logger.info(`Game ${active.title} closed. Candidate winner: ${winnerCandidateData ? winnerCandidateData.name : 'None'}`);
    return { winnerCandidate: winnerCandidateData, totalSubmissions: active.submissions.size };
  }

  public async approveWinner(winnerId: string, approvedBy: string, eventId: string): Promise<any> {
    const winner = await Winner.findById(winnerId).populate('studentId gameId');
    if (!winner) throw new Error('Winner record not found');

    winner.status = 'APPROVED';
    winner.approvedBy = approvedBy;
    winner.approvedAt = new Date();
    await winner.save();

    try {
      if (mongoose.Types.ObjectId.isValid(winner.gameId?._id ? winner.gameId._id.toString() : winner.gameId?.toString())) {
        await Game.findByIdAndUpdate(winner.gameId, { status: 'APPROVED' });
      }
    } catch (err) {}

    const student: any = winner.studentId;
    const game: any = winner.gameId;

    const auditPayload = {
      gameTitle: game ? game.title : 'Fresher Challenge',
      winnerName: student ? student.name : 'Winner Student',
      tokenNo: student ? student.tokenNo : 0,
      prize: winner.prizeAmount || 50,
      responseTimeMs: winner.responseTimeMs
    };

    try {
      await EventModel.findOneAndUpdate(
        { code: 'FRESHER2026' },
        {
          auditoriumState: {
            state: 'WINNER_PUBLISHED',
            payload: auditPayload,
            updatedAt: new Date()
          }
        }
      );
    } catch (err) {}

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

  public async publishWinner(winnerId: string, eventId: string): Promise<any> {
    const winner = await Winner.findById(winnerId).populate('studentId gameId');
    if (!winner) throw new Error('Winner record not found');

    winner.status = 'PUBLISHED';
    winner.publishedAt = new Date();
    await winner.save();

    await Game.findByIdAndUpdate(winner.gameId, { status: 'PUBLISHED' });

    const student: any = winner.studentId;
    const game: any = winner.gameId;

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

    logger.info(`Published winner ${student.name} for game ${game.title} to Auditorium!`);
    return winner;
  }

  // DRAW RANDOM NUMBER (FILTERED STRICTLY TO REGISTERED ENTERED STUDENTS ONLY!)
  public async drawRandomNumber(type: 'SPOTLIGHT' | 'LUCKY', eventId: string): Promise<{ number: number; student: any; registeredCount: number }> {
    // Query MongoDB ONLY for students who actually registered & entered the event
    let students: any[] = await Student.find({ isOnline: true }).select('name enrollmentNo tokenNo luckyNo spotlightNo');
    if (!students || students.length === 0) {
      // Fall back to all registered students in DB
      students = await Student.find({}).select('name enrollmentNo tokenNo luckyNo spotlightNo');
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

export const gameEngine = new GameEngine();
