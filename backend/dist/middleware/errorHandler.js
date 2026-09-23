"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const pino_js_1 = require("../config/pino.js");
const errorHandler = (err, req, res, next) => {
    pino_js_1.logger.error({ err, url: req.url, method: req.method }, 'Unhandled Express API Error');
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};
exports.errorHandler = errorHandler;
