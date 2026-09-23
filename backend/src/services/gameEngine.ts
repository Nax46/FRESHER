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
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');

    const dbQuestions = await Question.find({ gameId }).sort({ order: 1 });
    const questionsList: QuestionItem[] = dbQuestions.map(q => ({
      id: q._id.toString(),
      questionText: q.questionText,
      mediaContent: q.mediaContent,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      order: q.order
    }));

    const activeState: ActiveGameState = {
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
    await game.save();

    await EventModel.findByIdAndUpdate(eventId, { currentGameId: game._id });

    cacheService.setActiveGame(activeState);

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

    logger.info(`Game ${game.title} is now OPEN (${questionsList.length} questions).`);
    return activeState;
  }

  public async joinGame(gameId: string, studentId: string, eventId: string): Promise<{ joinedCount: number }> {
    const active = cacheService.getActiveGame();
    if (!active || active.gameId !== gameId) {
      throw new Error('Game is not currently open for joining');
    }
    if (active.status !== 'OPEN' && active.status !== 'LIVE') {
      throw new Error('Game joining is closed');
    }

    active.joinedStudentIds.add(studentId);

    Participant.updateOne(
      { gameId, studentId },
      { $setOnInsert: { joinedAt: new Date(), status: 'JOINED' } },
      { upsert: true }
    ).catch(err => logger.error({ err }, 'Failed to persist participant'));

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

  public async startGame(gameId: string, eventId: string): Promise<ActiveGameState> {
    const active = cacheService.getActiveGame();
    if (!active || active.gameId !== gameId) {
      throw new Error('Active game state mismatch');
    }

    active.status = 'LIVE';
    active.startTime = Date.now();
    active.winnerCandidateId = undefined;
    active.winnerCandidateResponseTime = undefined;

    await Game.findByIdAndUpdate(gameId, { status: 'LIVE', currentQuestionIndex: active.currentQuestionIndex });

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

    await Game.findByIdAndUpdate(gameId, {
      status: 'LIVE',
      currentQuestionIndex: active.currentQuestionIndex
    });

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
      this.io.to(`management:${active.gameId}`).to('management:FRESHER2026').emit('SUBMISSION_RECEIVED', {
        totalSubmissions: active.submissions.size,
        correctCount: Array.from(active.submissions.values()).filter(s => s.isCorrect).length
      });
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
    await Game.findByIdAndUpdate(gameId, { status: 'CLOSED' });

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

    await Game.findByIdAndUpdate(winner.gameId, { status: 'APPROVED' });

    const student: any = winner.studentId;
    const game: any = winner.gameId;

    if (this.io) {
      this.io.to(`management:${eventId}`).to('management:FRESHER2026').emit('WINNER_APPROVED', {
        winnerId: winner._id,
        studentName: student.name,
        tokenNo: student.tokenNo,
        gameTitle: game.title
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
