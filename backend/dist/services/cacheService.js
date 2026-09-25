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
    registerStudentSession(key, studentData) {
        const sessionObj = {
            studentId: studentData.studentId,
            name: studentData.name,
            enrollmentNo: studentData.enrollmentNo,
            tokenNo: studentData.tokenNo,
            luckyNo: studentData.luckyNo,
            spotlightNo: studentData.spotlightNo,
            sessionId: studentData.sessionId || key,
            lastActiveAt: Date.now(),
            isOnline: true
        };
        this.studentSessions.set(key, sessionObj);
        if (studentData.sessionId) {
            this.studentSessions.set(studentData.sessionId, sessionObj);
        }
        if (studentData.enrollmentNo) {
            this.studentSessions.set(studentData.enrollmentNo.toUpperCase(), sessionObj);
        }
        if (studentData.studentId) {
            this.studentSessions.set(studentData.studentId, sessionObj);
        }
    }
    touchStudentSession(identifier) {
        const session = this.getStudentByEnrollment(identifier) || this.studentSessions.get(identifier);
        if (session) {
            session.lastActiveAt = Date.now();
            session.isOnline = true;
        }
    }
    isEnrollmentActive(enrollmentNo, incomingSessionId) {
        const existing = this.getStudentByEnrollment(enrollmentNo);
        if (!existing)
            return false;
        // Active if marked online and updated within the last 2 minutes
        const isRecentlyActive = existing.isOnline && (Date.now() - (existing.lastActiveAt || 0) < 120000);
        if (!isRecentlyActive)
            return false;
        // If incoming request is from the SAME active session ID (reconnect / refresh), allow it!
        if (incomingSessionId && existing.sessionId && existing.sessionId === incomingSessionId) {
            return false;
        }
        // Otherwise, it's a different session attempting duplicate login -> Block it!
        return true;
    }
    getStudentBySession(sessionId) {
        return this.studentSessions.get(sessionId);
    }
    getStudentByEnrollment(enrollmentNo) {
        for (const session of this.studentSessions.values()) {
            if (session.enrollmentNo && session.enrollmentNo.toUpperCase() === enrollmentNo.toUpperCase()) {
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
        const uniqueActiveEnrollments = new Set();
        const now = Date.now();
        for (const session of this.studentSessions.values()) {
            if (session.enrollmentNo && session.isOnline && (now - (session.lastActiveAt || 0) < 120000)) {
                uniqueActiveEnrollments.add(session.enrollmentNo.toUpperCase());
            }
        }
        return uniqueActiveEnrollments.size;
    }
    getAllStudents() {
        const list = [];
        const seen = new Set();
        for (const session of this.studentSessions.values()) {
            if (session.enrollmentNo && !seen.has(session.enrollmentNo.toUpperCase())) {
                seen.add(session.enrollmentNo.toUpperCase());
                list.push(session);
            }
        }
        return list;
    }
    clearAllStudentSessions() {
        this.studentSessions.clear();
    }
    clearActiveGame() {
        this.activeGame = null;
    }
}
exports.cacheService = new InMemoryCache();
