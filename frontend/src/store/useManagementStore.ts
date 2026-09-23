import { create } from 'zustand';

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
  token: localStorage.getItem('fresher_admin_token'),
  adminUser: localStorage.getItem('fresher_admin_user'),
  metrics: {
    totalStudents: 0,
    onlineStudents: 0,
    totalGames: 0,
    totalWinners: 0,
    totalTokens: 0
  },
  currentGame: null,
  gameLibrary: [],
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
  setGameLibrary: (gameLibrary) => set({ gameLibrary }),
  setWinnerCandidate: (winnerCandidate) => set({ winnerCandidate }),
  setDrawnNumberResult: (drawnNumberResult) => set({ drawnNumberResult }),
  logout: () => {
    localStorage.removeItem('fresher_admin_token');
    localStorage.removeItem('fresher_admin_user');
    set({ token: null, adminUser: null, currentGame: null });
  }
}));
