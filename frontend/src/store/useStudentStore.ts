import { create } from 'zustand';

export interface StudentProfile {
  studentId: string;
  name: string;
  enrollmentNo: string;
  tokenNo: number;
  luckyNo: number;
  spotlightNo: number;
  sessionId: string;
}

export interface AvailableGame {
  gameId: string;
  title: string;
  type: string;
  status: 'OPEN' | 'LIVE' | 'CLOSED';
  timeLimit: number;
  prize: number;
  hasJoined?: boolean;
  hasSubmitted?: boolean;
  questionPreview?: {
    questionText: string;
    mediaContent?: string;
  } | null;
}

export interface LiveQuestion {
  id: string;
  questionText: string;
  mediaContent?: string;
  options: string[];
  order?: number;
}

interface StudentState {
  profile: StudentProfile | null;
  availableGame: AvailableGame | null;
  liveQuestion: LiveQuestion | null;
  gameState: 'WAITING' | 'GAME_AVAILABLE' | 'COUNTDOWN' | 'QUESTION' | 'SUBMITTED' | 'CLOSED';
  submittedResult: { isCorrect: boolean; responseTimeMs: number } | null;
  setProfile: (profile: StudentProfile | null) => void;
  setAvailableGame: (game: AvailableGame | null) => void;
  setLiveQuestion: (q: LiveQuestion | null) => void;
  setGameState: (state: 'WAITING' | 'GAME_AVAILABLE' | 'COUNTDOWN' | 'QUESTION' | 'SUBMITTED' | 'CLOSED') => void;
  setSubmittedResult: (res: { isCorrect: boolean; responseTimeMs: number } | null) => void;
  reset: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  profile: JSON.parse(localStorage.getItem('fresher_student_profile') || 'null'),
  availableGame: null,
  liveQuestion: null,
  gameState: 'WAITING',
  submittedResult: null,
  setProfile: (profile) => {
    if (profile) {
      localStorage.setItem('fresher_student_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('fresher_student_profile');
    }
    set({ profile });
  },
  setAvailableGame: (availableGame) => set({ availableGame }),
  setLiveQuestion: (liveQuestion) => set({ liveQuestion }),
  setGameState: (gameState) => set({ gameState }),
  setSubmittedResult: (submittedResult) => set({ submittedResult }),
  reset: () => {
    localStorage.removeItem('fresher_student_profile');
    set({ profile: null, availableGame: null, liveQuestion: null, gameState: 'WAITING', submittedResult: null });
  }
}));
