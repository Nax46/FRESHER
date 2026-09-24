"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const pino_js_1 = require("./config/pino.js");
const api_js_1 = __importDefault(require("./routes/api.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const socketManager_js_1 = require("./sockets/socketManager.js");
const seed_js_1 = require("./seed.js");
const Student_js_1 = require("./models/Student.js");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Process Level Error Catching — Prevents Server Crashes
process.on('unhandledRejection', (reason, promise) => {
    pino_js_1.logger.error({ reason }, 'Unhandled Rejection caught — keeping server online.');
});
process.on('uncaughtException', (error) => {
    pino_js_1.logger.error({ error }, 'Uncaught Exception caught — keeping server online.');
});
// Initialize Socket.IO with CORS configuration
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_js_1.ENV.CORS_ORIGIN,
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
exports.io = io;
// Security & Performance Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_js_1.ENV.CORS_ORIGIN, credentials: true }));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health & Readiness Endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date(), env: env_js_1.ENV.NODE_ENV });
});
app.get('/readiness', (req, res) => {
    res.json({ ready: true, time: new Date() });
});
// API Routes
app.use('/api/v1', api_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
// Initialize Socket Manager
(0, socketManager_js_1.initializeSocketManager)(io);
// Background Job: Purge students inactive for > 10 minutes (600,000 ms)
setInterval(async () => {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
            const result = await Student_js_1.Student.deleteMany({ lastActiveAt: { $lt: tenMinsAgo } });
            if (result.deletedCount > 0) {
                pino_js_1.logger.info(`🧹 Inactivity Purge: Deleted ${result.deletedCount} students inactive for > 10 mins.`);
            }
        }
    }
    catch (err) {
        pino_js_1.logger.error({ err }, 'Error running student inactivity purge job');
    }
}, 60 * 1000); // Check every 60 seconds
// Start Server Function
const startServer = async () => {
    const dbConnected = await (0, db_js_1.connectDB)();
    if (dbConnected) {
        try {
            await (0, seed_js_1.seedData)();
        }
        catch (err) {
            pino_js_1.logger.error({ err }, 'Error running seed data');
        }
    }
    httpServer.listen(env_js_1.ENV.PORT, () => {
        pino_js_1.logger.info(`🚀 Server listening on http://localhost:${env_js_1.ENV.PORT} [${env_js_1.ENV.NODE_ENV}]`);
    });
};
// Graceful Shutdown
const shutdown = () => {
    pino_js_1.logger.info('Shutting down server gracefully...');
    httpServer.close(() => {
        pino_js_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
startServer();
