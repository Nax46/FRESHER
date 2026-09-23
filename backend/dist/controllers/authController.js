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
    if (username === env_js_1.ENV.ADMIN_USERNAME && password === env_js_1.ENV.ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ username, role: 'admin' }, env_js_1.ENV.JWT_SECRET, { expiresIn: '12h' });
        return res.json({
            success: true,
            data: {
                token,
                username,
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
