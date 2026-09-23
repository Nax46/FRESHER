import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/pino.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocketManager } from './sockets/socketManager.js';
import { seedData } from './seed.js';
import { Student } from './models/Student.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketServer(httpServer, {
  cors: {
    origin: ENV.CORS_ORIGIN,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security & Performance Middlewares
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & Readiness Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date(), env: ENV.NODE_ENV });
});

app.get('/readiness', (req, res) => {
  res.json({ ready: true, time: new Date() });
});

// API Routes
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Initialize Socket Manager
initializeSocketManager(io);

// Background Job: Purge students inactive for > 10 minutes (600,000 ms)
setInterval(async () => {
  try {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await Student.deleteMany({ lastActiveAt: { $lt: tenMinsAgo } });
    if (result.deletedCount > 0) {
      logger.info(`🧹 Inactivity Purge: Deleted ${result.deletedCount} students inactive for > 10 mins.`);
    }
  } catch (err) {
    logger.error({ err }, 'Error running student inactivity purge job');
  }
}, 60 * 1000); // Check every 60 seconds

// Start Server Function
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    try {
      await seedData();
    } catch (err) {
      logger.error({ err }, 'Error running seed data');
    }
  }

  httpServer.listen(ENV.PORT, () => {
    logger.info(`🚀 Server listening on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
  });
};

// Graceful Shutdown
const shutdown = () => {
  logger.info('Shutting down server gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();

export { app, httpServer, io };
