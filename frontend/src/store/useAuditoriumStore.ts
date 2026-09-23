import { create } from 'zustand';

export interface AuditoriumDisplayState {
  state: 'WELCOME' | 'WAITING' | 'GAME_ANNOUNCEMENT' | 'COUNTDOWN' | 'GAME_LIVE' | 'GAME_CLOSED' | 'WINNER_PUBLISHED' | 'SPOTLIGHT_DRAW' | 'LUCKY_DRAW' | 'NEXT_GAME';
  payload: any;
  setAuditoriumState: (state: any, payload: any) => void;
}

export const useAuditoriumStore = create<AuditoriumDisplayState>((set) => ({
  state: 'WELCOME',
  payload: { title: '🎉 FRESHER 2026', subtitle: 'Welcome to the Game Arena!' },
  setAuditoriumState: (state, payload) => set({ state, payload })
}));
