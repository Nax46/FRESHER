"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://chaudharynax27_db_user:Nax-2903@cluster0.8f3mgjg.mongodb.net/fresher_event_db?retryWrites=true&w=majority',
    JWT_SECRET: process.env.JWT_SECRET || 'fresher_super_secret_jwt_key_2026',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'fresher2026',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
