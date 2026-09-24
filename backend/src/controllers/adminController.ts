import { Request, Response } from 'express';
import { Game } from '../models/Game.js';
import { Question } from '../models/Question.js';
import { Student } from '../models/Student.js';
import { Winner } from '../models/Winner.js';
import { EventModel } from '../models/Event.js';
import { gameEngine } from '../services/gameEngine.js';
import { cacheService } from '../services/cacheService.js';
import { logger } from '../config/pino.js';

const DEFAULT_GAMES = [
  {
    _id: 'game_emoji_01',
    title: '😂 Guess the Emoji',
    subtitle: 'Identify the movie or phrase represented by emojis',
    type: 'SPEED_MCQ',
    status: 'READY',
    timeLimit: 30,
    prize: 50,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'FIRST_CORRECT',
    description: 'First valid correct submission wins instant ₹50 cash prize!',
    totalQuestions: 10
  },
  {
    _id: 'game_quote_03',
    title: '👀 Who Said This?',
    subtitle: 'Identify which iconic professor or celebrity said this quote',
    type: 'SPEED_MCQ',
    status: 'READY',
    timeLimit: 20,
    prize: 50,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'FIRST_CORRECT',
    description: 'Guess the speaker instantly!',
    totalQuestions: 10
  },
  {
    _id: 'game_dialogue_04',
    title: '🎬 Complete the Dialogue',
    subtitle: 'Spotlight number stage challenge',
    type: 'SPOTLIGHT_CHALLENGE',
    status: 'READY',
    timeLimit: 60,
    prize: 100,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'JUDGE_SCORE',
    description: 'Draw Spotlight Number → Student comes to stage to perform dialogue.',
    totalQuestions: 5
  },
  {
    _id: 'game_memory_05',
    title: '🧠 Memory Challenge',
    subtitle: 'Remember the sequence shown on screen',
    type: 'SPOTLIGHT_CHALLENGE',
    status: 'READY',
    timeLimit: 60,
    prize: 100,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'JUDGE_SCORE',
    description: 'Visual memory test for spotlight selected student!',
    totalQuestions: 5
  }
];

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    let totalStudents = 0;
    let onlineStudents = 0;
    let totalGames = 8;
    let totalWinners = 0;

    try {
      totalStudents = await Student.countDocuments();
      onlineStudents = await Student.countDocuments({ isOnline: true });
      totalGames = await Game.countDocuments() || 8;
      totalWinners = await Winner.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } });
    } catch (dbErr) {}

    const activeGame = cacheService.getActiveGame();

    let currentGameData: any = null;
    if (activeGame) {
      currentGameData = {
        gameId: activeGame.gameId,
        title: activeGame.title,
        type: activeGame.type,
        status: activeGame.status,
        joinedCount: activeGame.joinedStudentIds.size,
        totalSubmissions: activeGame.submissions.size,
        currentQuestionIndex: activeGame.currentQuestionIndex,
        totalQuestions: activeGame.totalQuestions
      };
    }

    let latestWinnerCandidate: any = null;
    try {
      const candidateDoc = await Winner.findOne({ status: { $in: ['CANDIDATE', 'APPROVED'] } })
        .sort({ createdAt: -1 })
        .populate('studentId gameId');
      if (candidateDoc && candidateDoc.studentId) {
        const student: any = candidateDoc.studentId;
        const game: any = candidateDoc.gameId;
        latestWinnerCandidate = {
          winnerId: candidateDoc._id,
          studentId: student._id,
          name: student.name,
          tokenNo: student.tokenNo,
          enrollmentNo: student.enrollmentNo,
          responseTimeMs: candidateDoc.responseTimeMs,
          correctAnswer: candidateDoc.selectedAnswerText,
          status: candidateDoc.status,
          gameTitle: game ? game.title : ''
        };
      }
    } catch (err) {}

    return res.json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          onlineStudents,
          totalGames,
          totalWinners,
          totalTokens: totalStudents
        },
        currentGame: currentGameData,
        winnerCandidate: latestWinnerCandidate
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Dashboard error' });
  }
};

export const getGameLibrary = async (req: Request, res: Response) => {
  try {
    let games = await Game.find({}).sort({ createdAt: 1 });
    if (!games || games.length === 0) {
      games = DEFAULT_GAMES as any;
    }
    return res.json({ success: true, data: games });
  } catch (error: any) {
    logger.warn('Falling back to default games library');
    return res.json({ success: true, data: DEFAULT_GAMES });
  }
};

export const openGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const active = await gameEngine.openGame(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const startGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const active = await gameEngine.startGame(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const nextQuestionControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const active = await gameEngine.nextQuestion(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const closeGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const result = await gameEngine.closeGame(id, eventId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getGameResults = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  let winnerCandidate = null;
  try {
    winnerCandidate = await Winner.findOne({ gameId: id }).sort({ createdAt: -1 }).populate('studentId gameId');
  } catch (err) {}

  const active = cacheService.getActiveGame();

  let submissionsSummary = {
    totalSubmissions: 0,
    correctCount: 0,
    wrongCount: 0
  };

  if (active && active.gameId === id) {
    const subs = Array.from(active.submissions.values());
    submissionsSummary.totalSubmissions = subs.length;
    submissionsSummary.correctCount = subs.filter(s => s.isCorrect).length;
    submissionsSummary.wrongCount = subs.filter(s => !s.isCorrect).length;
  }

  return res.json({
    success: true,
    data: {
      candidate: winnerCandidate,
      summary: submissionsSummary
    }
  });
};

export const approveWinnerControl = async (req: Request, res: Response) => {
  const winnerId = req.params.winnerId as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const winner = await gameEngine.approveWinner(winnerId, 'Management Admin', eventId);
    return res.json({ success: true, data: winner });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const publishWinnerControl = async (req: Request, res: Response) => {
  const winnerId = req.params.winnerId as string;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const winner = await gameEngine.publishWinner(winnerId, eventId);
    return res.json({ success: true, data: winner });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const drawNumber = async (req: Request, res: Response) => {
  const { type } = req.body;
  let event = null;
  try {
    event = await EventModel.findOne({});
  } catch (err) {}
  const eventId = event ? event._id.toString() : 'FRESHER2026';

  try {
    const drawn = await gameEngine.drawRandomNumber(type, eventId);
    return res.json({ success: true, data: drawn });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
