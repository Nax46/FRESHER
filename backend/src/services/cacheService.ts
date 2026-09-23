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

class InMemoryCache {
  private activeGame: ActiveGameState | null = null;
  private studentSessions: Map<string, { studentId: string; name: string; enrollmentNo: string; tokenNo: number; luckyNo: number; spotlightNo: number }> = new Map();

  public getActiveGame(): ActiveGameState | null {
    return this.activeGame;
  }

  public setActiveGame(game: ActiveGameState | null): void {
    this.activeGame = game;
  }

  public registerStudentSession(sessionId: string, studentData: { studentId: string; name: string; enrollmentNo: string; tokenNo: number; luckyNo: number; spotlightNo: number }): void {
    this.studentSessions.set(sessionId, studentData);
  }

  public getStudentBySession(sessionId: string) {
    return this.studentSessions.get(sessionId);
  }

  public clearActiveGame(): void {
    this.activeGame = null;
  }
}

export const cacheService = new InMemoryCache();
