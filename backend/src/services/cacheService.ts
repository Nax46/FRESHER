export interface QuestionItem {
  id: string;
  questionText: string;
  mediaContent?: string;
  options: string[];
  correctOptionIndex: number;
  order: number;
}

export interface ActiveGameState {
  gameId: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'READY' | 'OPEN' | 'LIVE' | 'CLOSED' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  timeLimit: number;
  prize: number;
  questions: QuestionItem[];
  currentQuestionIndex: number;
  totalQuestions: number;
  startTime?: number;
  winnerCandidateId?: string;
  winnerCandidateResponseTime?: number;
  joinedStudentIds: Set<string>;
  submissions: Map<string, {
    selectedOptionIndex: number;
    isCorrect: boolean;
    responseTimeMs: number;
    timestamp: Date;
    questionIndex: number;
  }>;
}

export interface CachedStudentSession {
  studentId: string;
  name: string;
  enrollmentNo: string;
  tokenNo: number;
  luckyNo: number;
  spotlightNo: number;
  sessionId: string;
  lastActiveAt: number;
  isOnline: boolean;
}

class InMemoryCache {
  private activeGame: ActiveGameState | null = null;
  private studentSessions: Map<string, CachedStudentSession> = new Map();

  public getActiveGame(): ActiveGameState | null {
    return this.activeGame;
  }

  public setActiveGame(game: ActiveGameState | null): void {
    this.activeGame = game;
  }

  public registerStudentSession(key: string, studentData: any): void {
    const sessionObj: CachedStudentSession = {
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

  public touchStudentSession(identifier: string): void {
    const session = this.getStudentByEnrollment(identifier) || this.studentSessions.get(identifier);
    if (session) {
      session.lastActiveAt = Date.now();
      session.isOnline = true;
    }
  }

  public isEnrollmentActive(enrollmentNo: string, incomingSessionId?: string): boolean {
    const existing = this.getStudentByEnrollment(enrollmentNo);
    if (!existing) return false;

    // Active if marked online and updated within the last 2 minutes
    const isRecentlyActive = existing.isOnline && (Date.now() - (existing.lastActiveAt || 0) < 120000);

    if (!isRecentlyActive) return false;

    // If incoming request is from the SAME active session ID (reconnect / refresh), allow it!
    if (incomingSessionId && existing.sessionId && existing.sessionId === incomingSessionId) {
      return false;
    }

    // Otherwise, it's a different session attempting duplicate login -> Block it!
    return true;
  }

  public getStudentBySession(sessionId: string) {
    return this.studentSessions.get(sessionId);
  }

  public getStudentByEnrollment(enrollmentNo: string) {
    for (const session of this.studentSessions.values()) {
      if (session.enrollmentNo && session.enrollmentNo.toUpperCase() === enrollmentNo.toUpperCase()) {
        return session;
      }
    }
    return null;
  }

  public getStudentCount(): number {
    const uniqueEnrollments = new Set<string>();
    for (const session of this.studentSessions.values()) {
      if (session.enrollmentNo) {
        uniqueEnrollments.add(session.enrollmentNo.toUpperCase());
      }
    }
    return uniqueEnrollments.size;
  }

  public getOnlineStudentCount(): number {
    return this.getStudentCount();
  }

  public getAllStudents() {
    const list: any[] = [];
    const seen = new Set<string>();
    for (const session of this.studentSessions.values()) {
      if (session.enrollmentNo && !seen.has(session.enrollmentNo.toUpperCase())) {
        seen.add(session.enrollmentNo.toUpperCase());
        list.push(session);
      }
    }
    return list;
  }

  public clearAllStudentSessions(): void {
    this.studentSessions.clear();
  }

  public clearActiveGame(): void {
    this.activeGame = null;
  }
}

export const cacheService = new InMemoryCache();
