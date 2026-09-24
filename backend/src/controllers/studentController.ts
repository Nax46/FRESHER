import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { TokenService } from '../services/tokenService.js';
import { cacheService } from '../services/cacheService.js';
import { GameEngine } from '../services/gameEngine.js';
import { logger } from '../config/pino.js';
import v4 from 'crypto';

export const enterEvent = async (req: Request, res: Response) => {
  try {
    const { name, enrollmentNo } = req.body;
    if (!name || !enrollmentNo) {
      return res.status(400).json({ success: false, error: 'Full Name and Enrollment Number are required.' });
    }

    const upperEnrollment = enrollmentNo.toUpperCase().trim();
    let student = null;

    try {
      student = await Student.findOne({ enrollmentNo: upperEnrollment });
    } catch (dbErr) {
      logger.error({ err: dbErr }, 'DB lookup warning during enterEvent');
    }

    if (!student) {
      const tokens = await TokenService.generateUniqueTokens();
      const sessionId = v4.randomUUID();

      try {
        student = await Student.create({
          name,
          enrollmentNo: upperEnrollment,
          tokenNo: tokens.tokenNo,
          luckyNo: tokens.luckyNo,
          spotlightNo: tokens.spotlightNo,
          sessionId,
          isOnline: true,
          lastActiveAt: new Date()
        });
      } catch (createErr: any) {
        logger.error({ err: createErr }, 'Error creating student record in DB');
        // Fallback object if DB write hits temporary network glitch
        student = {
          _id: tokens.tokenNo,
          name,
          enrollmentNo: upperEnrollment,
          tokenNo: tokens.tokenNo,
          luckyNo: tokens.luckyNo,
          spotlightNo: tokens.spotlightNo,
          sessionId,
          isOnline: true
        } as any;
      }
    } else {
      student.name = name;
      student.isOnline = true;
      student.lastActiveAt = new Date();
      if (!student.sessionId) {
        student.sessionId = v4.randomUUID();
      }
      student.save().catch(err => logger.error({ err }, 'Error saving student update'));
    }

    cacheService.registerStudentSession(student.sessionId || student.enrollmentNo, {
      studentId: student._id.toString(),
      name: student.name,
      enrollmentNo: student.enrollmentNo,
      tokenNo: student.tokenNo,
      luckyNo: student.luckyNo,
      spotlightNo: student.spotlightNo
    });

    return res.json({
      success: true,
      data: {
        studentId: student._id.toString(),
        name: student.name,
        enrollmentNo: student.enrollmentNo,
        tokenNo: student.tokenNo,
        luckyNo: student.luckyNo,
        spotlightNo: student.spotlightNo,
        sessionId: student.sessionId
      }
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Critical error in enterEvent');
    return res.status(500).json({ success: false, error: 'Failed to verify entry session. Please try again.' });
  }
};

export const getStudentStatus = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    let student = null;

    try {
      student = await Student.findByIdAndUpdate(studentId, { lastActiveAt: new Date(), isOnline: true }, { new: true });
    } catch (dbErr) {}

    if (!student) {
      // Fallback lookup from session cache
      const activeGame = cacheService.getActiveGame();
      let availableGame: any = null;
      if (activeGame && (activeGame.status === 'OPEN' || activeGame.status === 'LIVE')) {
        availableGame = {
          gameId: activeGame.gameId,
          title: activeGame.title,
          type: activeGame.type,
          status: activeGame.status,
          timeLimit: activeGame.timeLimit,
          prize: activeGame.prize,
          hasJoined: activeGame.joinedStudentIds.has(studentId),
          hasSubmitted: activeGame.submissions.has(studentId)
        };
      }

      return res.json({
        success: true,
        data: {
          student: {
            id: studentId,
            name: 'Fresher Participant',
            enrollmentNo: 'EN2026',
            tokenNo: 1,
            luckyNo: 101,
            spotlightNo: 11
          },
          availableGame
        }
      });
    }

    const activeGame = cacheService.getActiveGame();

    let availableGame: any = null;
    if (activeGame && (activeGame.status === 'OPEN' || activeGame.status === 'LIVE')) {
      availableGame = {
        gameId: activeGame.gameId,
        title: activeGame.title,
        type: activeGame.type,
        status: activeGame.status,
        timeLimit: activeGame.timeLimit,
        prize: activeGame.prize,
        hasJoined: activeGame.joinedStudentIds.has(studentId),
        hasSubmitted: activeGame.submissions.has(studentId)
      };
    }

    return res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          tokenNo: student.tokenNo,
          luckyNo: student.luckyNo,
          spotlightNo: student.spotlightNo
        },
        availableGame
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Error fetching student status' });
  }
};
