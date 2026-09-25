import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../config/pino.js';
import { gameEngine } from '../services/gameEngine.js';
import { Student } from '../models/Student.js';

import { cacheService } from '../services/cacheService.js';

export const broadcastMetrics = async (io: SocketServer) => {
  let totalStudents = cacheService.getStudentCount();
  let onlineStudents = cacheService.getOnlineStudentCount();
  try {
    const dbTotal = await Student.countDocuments();
    const dbOnline = await Student.countDocuments({
      isOnline: true,
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    totalStudents = Math.max(totalStudents, dbTotal);
    onlineStudents = Math.max(onlineStudents, dbOnline);
  } catch (err) {}

  io.emit('METRICS_UPDATED', {
    totalStudents,
    onlineStudents,
    totalGames: 4,
    totalTokens: totalStudents
  });
};

export const initializeSocketManager = (io: SocketServer) => {
  gameEngine.setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, 'New Socket.IO client connected');
    broadcastMetrics(io).catch(() => {});

    socket.on('JOIN_EVENT_ROOM', async (data: { eventId: string; studentId?: string }) => {
      const { eventId, studentId } = data;
      socket.join(`event:${eventId}`);
      socket.join('event:FRESHER2026'); // Also join global event code room
      logger.info({ socketId: socket.id, eventId }, 'Client joined event room');

      if (studentId) {
        socket.data.studentId = studentId;
        cacheService.touchStudentSession(studentId);
        Student.findByIdAndUpdate(studentId, { isOnline: true, socketId: socket.id, lastActiveAt: new Date() })
          .then(() => broadcastMetrics(io))
          .catch(() => {});
      } else {
        broadcastMetrics(io).catch(() => {});
      }
    });

    socket.on('PING_HEARTBEAT', () => {
      if (socket.data.studentId) {
        cacheService.touchStudentSession(socket.data.studentId);
        Student.findByIdAndUpdate(socket.data.studentId, { isOnline: true, lastActiveAt: new Date() }).catch(() => {});
      }
    });

    socket.on('JOIN_MANAGEMENT_ROOM', (data: { eventId: string }) => {
      const { eventId } = data;
      socket.join(`management:${eventId}`);
      socket.join('management:FRESHER2026');
      logger.info({ socketId: socket.id, eventId }, 'Client joined management room');
      broadcastMetrics(io).catch(() => {});
    });

    socket.on('JOIN_AUDITORIUM_ROOM', (data: { eventId: string }) => {
      const { eventId } = data;
      socket.join(`auditorium:${eventId}`);
      socket.join('auditorium:FRESHER2026');
      logger.info({ socketId: socket.id, eventId }, 'Client joined auditorium room');
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket.IO client disconnected');
      if (socket.data.studentId) {
        const student = cacheService.getStudentBySession(socket.data.studentId);
        if (student) {
          student.isOnline = false;
        }
        Student.findByIdAndUpdate(socket.data.studentId, { isOnline: false, lastActiveAt: new Date() })
          .then(() => broadcastMetrics(io))
          .catch(() => {});
      } else {
        broadcastMetrics(io).catch(() => {});
      }
    });
  });
};
