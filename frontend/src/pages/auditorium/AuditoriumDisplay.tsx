import React, { useEffect } from 'react';
import { useAuditoriumStore } from '../../store/useAuditoriumStore';
import { socket } from '../../sockets/socketClient';
import { Trophy, Sparkles, Star, Gamepad2, Hourglass, CheckCircle, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';

export const AuditoriumDisplay: React.FC = () => {
  const { state, payload, setAuditoriumState } = useAuditoriumStore();

  useEffect(() => {
    // Join Auditorium socket room
    socket.emit('JOIN_AUDITORIUM_ROOM', { eventId: 'FRESHER2026' });

    fetchState();

    socket.on('AUDITORIUM_UPDATED', (data) => {
      setAuditoriumState(data.state, data.payload);
      if (data.state === 'WINNER_PUBLISHED') {
        // Trigger celebratory confetti on auditorium screen
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      }
    });

    return () => {
      socket.off('AUDITORIUM_UPDATED');
    };
  }, []);

  const fetchState = async () => {
    try {
      const res = await axios.get('/api/v1/auditorium/state');
      if (res.data.success && res.data.data) {
        setAuditoriumState(res.data.data.state, res.data.data.payload);
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Header Badge */}
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-sm font-black tracking-widest text-slate-400 uppercase">AUDITORIUM DISPLAY • STAGE SCREEN</span>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center space-y-8 z-10">
        {/* STATE 1: WELCOME */}
        {state === 'WELCOME' && (
          <div className="space-y-6 animate-countdown">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-2xl shadow-purple-500/50 mb-2">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              {payload?.title || '🎉 WELCOME FRESHERS 2026'}
            </h1>
            <p className="text-2xl font-bold text-slate-300 tracking-wide">
              {payload?.subtitle || 'Get ready for the Ultimate Live Game Arena! Scan QR to Join!'}
            </p>
          </div>
        )}

        {/* STATE 2: WAITING */}
        {state === 'WAITING' && (
          <div className="space-y-6 animate-countdown">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-900 border border-purple-500/30 text-purple-400 shadow-2xl mb-2">
              <Hourglass className="w-12 h-12 animate-spin" />
            </div>
            <h1 className="text-6xl font-black text-white">⏳ GET READY</h1>
            <p className="text-2xl font-bold text-purple-300">The Next Challenge Will Appear Soon...</p>
          </div>
        )}

        {/* STATE 3: GAME ANNOUNCEMENT */}
        {state === 'GAME_ANNOUNCEMENT' && (
          <div className="space-y-6 animate-countdown">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest">
              🎮 NEXT GAME ANNOUNCEMENT
            </span>
            <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tight">
              {payload?.gameTitle || 'GUESS THE EMOJI'}
            </h1>
            <div className="inline-block bg-slate-900/90 border border-amber-500/40 px-8 py-3 rounded-2xl">
              <span className="text-2xl font-black text-amber-300">Winner Prize: ₹{payload?.prize || 50}</span>
            </div>
          </div>
        )}

        {/* STATE 4: COUNTDOWN */}
        {state === 'COUNTDOWN' && (
          <div className="space-y-6 animate-countdown">
            <span className="text-xl font-black uppercase text-purple-300 tracking-widest">GET READY...</span>
            <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
              3... 2... 1...
            </div>
          </div>
        )}

        {/* STATE 5: GAME LIVE QUESTION */}
        {state === 'GAME_LIVE' && (
          <div className="space-y-6 animate-countdown">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest animate-pulse">
              🟢 GAME LIVE — SUBMIT ON YOUR PHONE
            </span>
            <h2 className="text-4xl font-extrabold text-purple-300">{payload?.gameTitle}</h2>

            {payload?.question && (
              <div className="glass-card rounded-3xl p-8 border border-purple-500/30 max-w-3xl mx-auto space-y-4 shadow-2xl">
                {payload.question.mediaContent && (
                  <div className="text-7xl font-black tracking-widest text-amber-300 py-4">
                    {payload.question.mediaContent}
                  </div>
                )}
                <h3 className="text-3xl font-black text-white">{payload.question.questionText}</h3>
              </div>
            )}
          </div>
        )}

        {/* STATE 6: GAME CLOSED */}
        {state === 'GAME_CLOSED' && (
          <div className="space-y-6 animate-countdown">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-2">
              <Hourglass className="w-12 h-12" />
            </div>
            <h1 className="text-6xl font-black text-white">⏰ GAME CLOSED</h1>
            <p className="text-2xl font-bold text-amber-300">Management is reviewing results...</p>
          </div>
        )}

        {/* STATE 7: WINNER PUBLISHED */}
        {state === 'WINNER_PUBLISHED' && (
          <div className="space-y-8 animate-countdown">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-2xl shadow-amber-400/50 mb-2">
              <Trophy className="w-16 h-16 fill-current" />
            </div>

            <div className="space-y-2">
              <span className="text-lg font-black uppercase tracking-widest text-amber-400">🎉 OFFICIAL WINNER ANNOUNCEMENT</span>
              <h3 className="text-3xl font-extrabold text-purple-300">{payload?.gameTitle}</h3>
            </div>

            <div className="glass-card rounded-3xl p-10 border border-amber-500/50 max-w-2xl mx-auto space-y-4 glow-gold">
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight">{payload?.winnerName}</h1>
              <div className="flex items-center justify-center space-x-6 text-xl font-bold">
                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/40 px-6 py-2 rounded-full flex items-center space-x-2">
                  <Ticket className="w-6 h-6" />
                  <span>TOKEN #{payload?.tokenNo}</span>
                </span>
                <span className="bg-amber-500/30 text-amber-200 border border-amber-400/40 px-6 py-2 rounded-full">
                  Prize: ₹{payload?.prize || 50}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SPOTLIGHT DRAW STAGE CALL */}
        {state === 'SPOTLIGHT_DRAW' && (
          <div className="space-y-6 animate-countdown">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-2">
              <Star className="w-12 h-12" />
            </div>
            <span className="text-lg font-black uppercase tracking-widest text-cyan-400">⭐ SPOTLIGHT NUMBER DRAWN</span>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 py-2">
              #{payload?.number}
            </div>
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-white">{payload?.studentName}</h2>
              <p className="text-xl font-bold text-cyan-300 mt-2">PLEASE COME TO THE STAGE!</p>
            </div>
          </div>
        )}

        {/* LUCKY DRAW STAGE CALL */}
        {state === 'LUCKY_DRAW' && (
          <div className="space-y-6 animate-countdown">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-2">
              <Sparkles className="w-12 h-12" />
            </div>
            <span className="text-lg font-black uppercase tracking-widest text-amber-400">🍀 LUCKY NUMBER FACULTY 1v1</span>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 py-2">
              #{payload?.number}
            </div>
            <div className="glass-card rounded-2xl p-6 border border-amber-500/30 max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-white">{payload?.studentName}</h2>
              <p className="text-xl font-bold text-amber-300 mt-2">STUDENT VS FACULTY SHOWDOWN — COME TO STAGE!</p>
            </div>
          </div>
        )}

        {/* STATE 8: NEXT GAME */}
        {state === 'NEXT_GAME' && (
          <div className="space-y-6 animate-countdown">
            <span className="text-lg font-black uppercase tracking-widest text-pink-400">UPCOMING CHALLENGE</span>
            <h1 className="text-6xl font-black text-white">{payload?.title || '🎵 Finish the Lyrics'}</h1>
            <p className="text-2xl font-bold text-purple-300">Stay Ready on Your Student Portal!</p>
          </div>
        )}
      </div>
    </div>
  );
};
