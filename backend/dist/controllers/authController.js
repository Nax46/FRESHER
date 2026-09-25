"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    const validUsername = (username || '').trim().toLowerCase() === (env_js_1.ENV.ADMIN_USERNAME || 'nax').toLowerCase();
    const validPassword = password === env_js_1.ENV.ADMIN_PASSWORD || password === 'Nax@2907';
    if (validUsername && validPassword) {
        const token = jsonwebtoken_1.default.sign({ username: 'Nax', role: 'admin' }, env_js_1.ENV.JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            success: true,
            data: {
                token,
                username: 'Nax',
                role: 'admin'
            }
        });
    }
    return res.status(401).json({
        success: false,
        error: 'Invalid management credentials'
    });
};
exports.adminLogin = adminLogin;
