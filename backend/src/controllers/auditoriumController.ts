import { Request, Response } from 'express';
import { EventModel } from '../models/Event.js';
import { gameEngine } from '../services/gameEngine.js';

export const getAuditoriumState = async (req: Request, res: Response) => {
  const event = await EventModel.findOne({});
  if (!event) {
    return res.json({
      success: true,
      data: {
        state: 'WELCOME',
        payload: { title: '🎉 FRESHER 2026', message: 'Welcome to the Game Arena!' }
      }
    });
  }

  return res.json({
    success: true,
    data: event.auditoriumState
  });
};

export const setAuditoriumState = async (req: Request, res: Response) => {
  const { state, payload } = req.body;
  const event = await EventModel.findOne({});
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  event.auditoriumState = {
    state,
    payload: payload || {},
    updatedAt: new Date()
  };
  await event.save();

  // Socket broadcast to auditorium channel
  if ((gameEngine as any).io) {
    (gameEngine as any).io.to(`auditorium:${event._id}`).emit('AUDITORIUM_UPDATED', event.auditoriumState);
  }

  return res.json({ success: true, data: event.auditoriumState });
};
