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
    getStudentByEnrollment(enrollmentNo) {
        for (const session of this.studentSessions.values()) {
            if (session.enrollmentNo.toUpperCase() === enrollmentNo.toUpperCase()) {
                return session;
            }
        }
        return null;
    }
    getStudentCount() {
        const uniqueEnrollments = new Set();
        for (const session of this.studentSessions.values()) {
            if (session.enrollmentNo) {
                uniqueEnrollments.add(session.enrollmentNo.toUpperCase());
            }
        }
        return uniqueEnrollments.size;
    }
    getOnlineStudentCount() {
        return this.getStudentCount();
    }
    clearAllStudentSessions() {
        this.studentSessions.clear();
    }
    clearActiveGame() {
        this.activeGame = null;
    }
}
exports.cacheService = new InMemoryCache();
