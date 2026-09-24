"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const studentController_js_1 = require("../controllers/studentController.js");
const gameController_js_1 = require("../controllers/gameController.js");
const adminController_js_1 = require("../controllers/adminController.js");
const auditoriumController_js_1 = require("../controllers/auditoriumController.js");
const auth_js_1 = require("../middleware/auth.js");
const zodValidate_js_1 = require("../middleware/zodValidate.js");
const validators_js_1 = require("../validators/validators.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const router = (0, express_1.Router)();
// Student Endpoints
router.post('/event/enter', rateLimiter_js_1.apiRateLimiter, (0, zodValidate_js_1.validateBody)(validators_js_1.enterEventSchema), studentController_js_1.enterEvent);
router.get('/student/status/:studentId', rateLimiter_js_1.apiRateLimiter, studentController_js_1.getStudentStatus);
router.post('/games/:gameId/join', rateLimiter_js_1.apiRateLimiter, gameController_js_1.joinGame);
router.post('/games/submit', rateLimiter_js_1.apiRateLimiter, (0, zodValidate_js_1.validateBody)(validators_js_1.submitAnswerSchema), gameController_js_1.submitAnswer);
// Management Auth
router.post('/admin/login', rateLimiter_js_1.authRateLimiter, (0, zodValidate_js_1.validateBody)(validators_js_1.adminLoginSchema), authController_js_1.adminLogin);
// Management Protected APIs
router.get('/admin/dashboard', auth_js_1.authenticateAdmin, adminController_js_1.getDashboardMetrics);
router.get('/admin/games', auth_js_1.authenticateAdmin, adminController_js_1.getGameLibrary);
router.post('/admin/games/:id/open', auth_js_1.authenticateAdmin, adminController_js_1.openGameControl);
router.post('/admin/games/:id/start', auth_js_1.authenticateAdmin, adminController_js_1.startGameControl);
router.post('/admin/games/:id/next-question', auth_js_1.authenticateAdmin, adminController_js_1.nextQuestionControl);
router.post('/admin/games/:id/close', auth_js_1.authenticateAdmin, adminController_js_1.closeGameControl);
router.get('/admin/games/:id/results', auth_js_1.authenticateAdmin, adminController_js_1.getGameResults);
router.post('/admin/winners/:winnerId/approve', auth_js_1.authenticateAdmin, adminController_js_1.approveWinnerControl);
router.post('/admin/winners/:winnerId/publish', auth_js_1.authenticateAdmin, adminController_js_1.publishWinnerControl);
router.post('/admin/draw-number', auth_js_1.authenticateAdmin, adminController_js_1.drawNumber);
router.post('/admin/reset-students', auth_js_1.authenticateAdmin, adminController_js_1.resetAllStudentsControl);
router.post('/admin/auditorium/state', auth_js_1.authenticateAdmin, (0, zodValidate_js_1.validateBody)(validators_js_1.updateAuditoriumSchema), auditoriumController_js_1.setAuditoriumState);
// Auditorium Read-Only Public API
router.get('/auditorium/state', auditoriumController_js_1.getAuditoriumState);
exports.default = router;
