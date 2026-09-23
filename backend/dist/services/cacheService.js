"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
class InMemoryCache {
    activeGame = null;
    studentSessions = new Map();
    getActiveGame() {
        return this.activeGame;
    }
    setActiveGame(game) {
        this.activeGame = game;
    }
    registerStudentSession(sessionId, studentData) {
        this.studentSessions.set(sessionId, studentData);
    }
    getStudentBySession(sessionId) {
        return this.studentSessions.get(sessionId);
    }
    clearActiveGame() {
        this.activeGame = null;
    }
}
exports.cacheService = new InMemoryCache();
