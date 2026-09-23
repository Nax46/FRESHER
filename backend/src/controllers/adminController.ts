import { Request, Response } from 'express';
import { Game } from '../models/Game.js';
import { Question } from '../models/Question.js';
import { Student } from '../models/Student.js';
import { Winner } from '../models/Winner.js';
import { EventModel } from '../models/Event.js';
import { gameEngine } from '../services/gameEngine.js';
import { cacheService } from '../services/cacheService.js';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  const totalStudents = await Student.countDocuments();
  const onlineStudents = await Student.countDocuments({ isOnline: true });
  const totalGames = await Game.countDocuments();
  const totalWinners = await Winner.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } });

  const activeGame = cacheService.getActiveGame();

  let currentGameData: any = null;
  if (activeGame) {
    currentGameData = {
      gameId: activeGame.gameId,
      title: activeGame.title,
      type: activeGame.type,
      status: activeGame.status,
      joinedCount: activeGame.joinedStudentIds.size,
      totalSubmissions: activeGame.submissions.size
    };
  }

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
      currentGame: currentGameData
    }
  });
};

export const getGameLibrary = async (req: Request, res: Response) => {
  const games = await Game.find({}).sort({ createdAt: 1 });
  return res.json({ success: true, data: games });
};

export const openGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const active = await gameEngine.openGame(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const startGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const active = await gameEngine.startGame(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const nextQuestionControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const active = await gameEngine.nextQuestion(id, eventId);
    return res.json({ success: true, data: active });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const closeGameControl = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const result = await gameEngine.closeGame(id, eventId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getGameResults = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const winnerCandidate = await Winner.findOne({ gameId: id }).sort({ createdAt: -1 }).populate('studentId gameId');
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
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const winner = await gameEngine.approveWinner(winnerId, 'Management Admin', eventId);
    return res.json({ success: true, data: winner });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const publishWinnerControl = async (req: Request, res: Response) => {
  const winnerId = req.params.winnerId as string;
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const winner = await gameEngine.publishWinner(winnerId, eventId);
    return res.json({ success: true, data: winner });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const drawNumber = async (req: Request, res: Response) => {
  const { type } = req.body; // 'SPOTLIGHT' | 'LUCKY'
  const event = await EventModel.findOne({});
  const eventId = event ? event._id.toString() : 'default';

  try {
    const drawn = await gameEngine.drawRandomNumber(type, eventId);
    return res.json({ success: true, data: drawn });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
