import { z } from 'zod';

export const enterEventSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  enrollmentNo: z.string().min(4, 'Enrollment number required').max(30)
});

export const submitAnswerSchema = z.object({
  gameId: z.string(),
  selectedOptionIndex: z.number().int().min(0).max(10),
  studentId: z.string()
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const updateAuditoriumSchema = z.object({
  state: z.enum(['WELCOME', 'WAITING', 'GAME_ANNOUNCEMENT', 'COUNTDOWN', 'GAME_LIVE', 'GAME_CLOSED', 'WINNER_PUBLISHED', 'SPOTLIGHT_DRAW', 'LUCKY_DRAW', 'NEXT_GAME']),
  payload: z.record(z.any()).optional()
});
