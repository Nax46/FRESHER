import { create } from 'zustand';

export const INITIAL_GAMES = [
  {
    _id: 'game_emoji_01',
    title: '😂 Guess the Emoji',
    subtitle: 'Identify the movie or phrase represented by emojis',
    type: 'SPEED_MCQ',
    status: 'READY',
    timeLimit: 30,
    prize: 50,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'FIRST_CORRECT',
    description: 'First valid correct submission wins instant ₹50 cash prize!',
    totalQuestions: 10
  },
  {
    _id: 'game_quote_03',
    title: '👀 Who Said This?',
    subtitle: 'Identify which iconic professor or celebrity said this quote',
    type: 'SPEED_MCQ',
    status: 'READY',
    timeLimit: 20,
    prize: 50,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'FIRST_CORRECT',
    description: 'Guess the speaker instantly!',
    totalQuestions: 10
  },
  {
    _id: 'game_dialogue_04',
    title: '🎬 Complete the Dialogue',
    subtitle: 'Spotlight number stage challenge',
    type: 'SPOTLIGHT_CHALLENGE',
    status: 'READY',
    timeLimit: 60,
    prize: 100,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'JUDGE_SCORE',
    description: 'Draw Spotlight Number → Student comes to stage to perform dialogue.',
    totalQuestions: 5
  },
  {
    _id: 'game_memory_05',
    title: '🧠 Memory Challenge',
    subtitle: 'Remember the sequence shown on screen',
    type: 'SPOTLIGHT_CHALLENGE',
    status: 'READY',
    timeLimit: 60,
    prize: 100,
    attemptRule: 'ONE_ATTEMPT',
    winnerRule: 'JUDGE_SCORE',
    description: 'Visual memory test for spotlight selected student!',
    totalQuestions: 5
  }
];

export interface ManagementState {
  token: string | null;
  adminUser: string | null;
  metrics: {
    totalStudents: number;
    onlineStudents: number;
    totalGames: number;
    totalWinners: number;
    totalTokens: number;
  };
  currentGame: any | null;
  gameLibrary: any[];
  winnerCandidate: any | null;
  drawnNumberResult: { type: 'SPOTLIGHT' | 'LUCKY'; number: number; student: any } | null;
  setAuth: (token: string | null, adminUser: string | null) => void;
  setMetrics: (metrics: any) => void;
  setCurrentGame: (game: any) => void;
  setGameLibrary: (games: any[]) => void;
  setWinnerCandidate: (candidate: any) => void;
  setDrawnNumberResult: (res: any) => void;
  logout: () => void;
}

export const useManagementStore = create<ManagementState>((set) => ({
  token: localStorage.getItem('fresher_admin_token') || 'demo_token',
  adminUser: localStorage.getItem('fresher_admin_user') || 'admin',
  metrics: {
    totalStudents: 0,
    onlineStudents: 0,
    totalGames: 4,
    totalWinners: 0,
    totalTokens: 0
  },
  currentGame: null,
  gameLibrary: INITIAL_GAMES,
  winnerCandidate: null,
  drawnNumberResult: null,
  setAuth: (token, adminUser) => {
    if (token && adminUser) {
      localStorage.setItem('fresher_admin_token', token);
      localStorage.setItem('fresher_admin_user', adminUser);
    } else {
      localStorage.removeItem('fresher_admin_token');
      localStorage.removeItem('fresher_admin_user');
    }
    set({ token, adminUser });
  },
  setMetrics: (metrics) => set({ metrics }),
  setCurrentGame: (currentGame) => set({ currentGame }),
  setGameLibrary: (gameLibrary) => set({ gameLibrary: gameLibrary && gameLibrary.length > 0 ? gameLibrary : INITIAL_GAMES }),
  setWinnerCandidate: (winnerCandidate) => set({ winnerCandidate }),
  setDrawnNumberResult: (drawnNumberResult) => set({ drawnNumberResult }),
  logout: () => {
    localStorage.removeItem('fresher_admin_token');
    localStorage.removeItem('fresher_admin_user');
    set({ token: null, adminUser: null, currentGame: null });
  }
}));
