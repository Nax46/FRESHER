"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const pino_js_1 = require("./pino.js");
const connectDB = async () => {
    try {
        mongoose_1.default.set('strictQuery', true);
        // Allow buffering during connection setup so queries don't fail immediately
        mongoose_1.default.set('bufferCommands', true);
        await mongoose_1.default.connect(env_js_1.ENV.MONGO_URI, {
            maxPoolSize: 50,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        pino_js_1.logger.info(`MongoDB connected to: ${mongoose_1.default.connection.host}`);
        return true;
    }
    catch (error) {
        pino_js_1.logger.error({ err: error }, 'MongoDB connection failure. Operating with fallback resilience.');
        return false;
    }
};
exports.connectDB = connectDB;
