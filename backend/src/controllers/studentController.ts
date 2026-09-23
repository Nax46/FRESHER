import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { TokenService } from '../services/tokenService.js';
import { cacheService } from '../services/cacheService.js';
import { EventModel } from '../models/Event.js';
import { Game } from '../models/Game.js';
import { Question } from '../models/Question.js';
import v4 from 'crypto';

export const enterEvent = async (req: Request, res: Response) => {
  const { name, enrollmentNo } = req.body;
  const upperEnrollment = enrollmentNo.toUpperCase().trim();

  let student = await Student.findOne({ enrollmentNo: upperEnrollment });

  if (!student) {
    // Generate new unique physical fresher token tuple
    const tokens = await TokenService.generateUniqueTokens();
    const sessionId = v4.randomUUID();

    student = await Student.create({
      name,
      enrollmentNo: upperEnrollment,
      tokenNo: tokens.tokenNo,
      luckyNo: tokens.luckyNo,
      spotlightNo: tokens.spotlightNo,
      sessionId,
      isOnline: true
    });
  } else {
    // Re-use existing student session
    student.name = name;
    student.isOnline = true;
    student.lastActiveAt = new Date();
    if (!student.sessionId) {
      student.sessionId = v4.randomUUID();
    }
    await student.save();
  }

  cacheService.registerStudentSession(student.sessionId!, {
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
      studentId: student._id,
      name: student.name,
      enrollmentNo: student.enrollmentNo,
      tokenNo: student.tokenNo,
      luckyNo: student.luckyNo,
      spotlightNo: student.spotlightNo,
      sessionId: student.sessionId
    }
  });
};

export const getStudentStatus = async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const student = await Student.findByIdAndUpdate(studentId, { lastActiveAt: new Date(), isOnline: true }, { new: true });
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
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
};
