import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../config/pino.js';
import { gameEngine } from '../services/gameEngine.js';
import { Student } from '../models/Student.js';

export const initializeSocketManager = (io: SocketServer) => {
  gameEngine.setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, 'New Socket.IO client connected');

    socket.on('JOIN_EVENT_ROOM', async (data: { eventId: string; studentId?: string }) => {
      const { eventId, studentId } = data;
      socket.join(`event:${eventId}`);
      socket.join('event:FRESHER2026'); // Also join global event code room
      logger.info({ socketId: socket.id, eventId }, 'Client joined event room');

      if (studentId) {
        socket.data.studentId = studentId;
        Student.findByIdAndUpdate(studentId, { isOnline: true, socketId: socket.id, lastActiveAt: new Date() }).catch(() => {});
      }
    });

    socket.on('PING_HEARTBEAT', () => {
      if (socket.data.studentId) {
        Student.findByIdAndUpdate(socket.data.studentId, { isOnline: true, lastActiveAt: new Date() }).catch(() => {});
      }
    });

    socket.on('JOIN_MANAGEMENT_ROOM', (data: { eventId: string }) => {
      const { eventId } = data;
      socket.join(`management:${eventId}`);
      socket.join('management:FRESHER2026');
      logger.info({ socketId: socket.id, eventId }, 'Client joined management room');
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
        Student.findByIdAndUpdate(socket.data.studentId, { isOnline: false, lastActiveAt: new Date() }).catch(() => {});
      }
    });
  });
};
