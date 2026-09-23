import { Request, Response } from 'express';
import { gameEngine } from '../services/gameEngine.js';
import { cacheService } from '../services/cacheService.js';
import { EventModel } from '../models/Event.js';

export const joinGame = async (req: Request, res: Response) => {
  const gameId = req.params.gameId as string;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'Student ID required' });
  }

  try {
    const defaultEvent = await EventModel.findOne({});
    const eventId = defaultEvent ? defaultEvent._id.toString() : 'default';
    const result = await gameEngine.joinGame(gameId, studentId, eventId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  const { gameId, selectedOptionIndex, studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'Student ID required' });
  }

  try {
    const result = gameEngine.submitAnswer(gameId, studentId, selectedOptionIndex);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
