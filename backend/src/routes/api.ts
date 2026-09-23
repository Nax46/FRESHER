import { Router } from 'express';
import { adminLogin } from '../controllers/authController.js';
import { enterEvent, getStudentStatus } from '../controllers/studentController.js';
import { joinGame, submitAnswer } from '../controllers/gameController.js';
import {
  getDashboardMetrics,
  getGameLibrary,
  openGameControl,
  startGameControl,
  nextQuestionControl,
  closeGameControl,
  getGameResults,
  approveWinnerControl,
  publishWinnerControl,
  drawNumber
} from '../controllers/adminController.js';
import { getAuditoriumState, setAuditoriumState } from '../controllers/auditoriumController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/zodValidate.js';
import { enterEventSchema, submitAnswerSchema, adminLoginSchema, updateAuditoriumSchema } from '../validators/validators.js';
import { apiRateLimiter, authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Student Endpoints
router.post('/event/enter', apiRateLimiter, validateBody(enterEventSchema), enterEvent);
router.get('/student/status/:studentId', apiRateLimiter, getStudentStatus);
router.post('/games/:gameId/join', apiRateLimiter, joinGame);
router.post('/games/submit', apiRateLimiter, validateBody(submitAnswerSchema), submitAnswer);

// Management Auth
router.post('/admin/login', authRateLimiter, validateBody(adminLoginSchema), adminLogin);

// Management Protected APIs
router.get('/admin/dashboard', authenticateAdmin, getDashboardMetrics);
router.get('/admin/games', authenticateAdmin, getGameLibrary);
router.post('/admin/games/:id/open', authenticateAdmin, openGameControl);
router.post('/admin/games/:id/start', authenticateAdmin, startGameControl);
router.post('/admin/games/:id/next-question', authenticateAdmin, nextQuestionControl);
router.post('/admin/games/:id/close', authenticateAdmin, closeGameControl);
router.get('/admin/games/:id/results', authenticateAdmin, getGameResults);
router.post('/admin/winners/:winnerId/approve', authenticateAdmin, approveWinnerControl);
router.post('/admin/winners/:winnerId/publish', authenticateAdmin, publishWinnerControl);
router.post('/admin/draw-number', authenticateAdmin, drawNumber);
router.post('/admin/auditorium/state', authenticateAdmin, validateBody(updateAuditoriumSchema), setAuditoriumState);

// Auditorium Read-Only Public API
router.get('/auditorium/state', getAuditoriumState);

export default router;
