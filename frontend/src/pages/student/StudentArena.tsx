import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/useStudentStore';
import { TokenCard } from '../../components/TokenCard';
import { socket } from '../../sockets/socketClient';
import { Gamepad2, Hourglass, Play, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import axios from 'axios';

export const StudentArena: React.FC = () => {
  const navigate = useNavigate();
  const { profile, availableGame, setAvailableGame, setLiveQuestion, setGameState, gameState, setSubmittedResult, reset } = useStudentStore();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate('/student');
      return;
    }

    // Join Socket.IO event room
    socket.emit('JOIN_EVENT_ROOM', { eventId: 'FRESHER2026', studentId: profile.studentId });

    // 30-second ping heartbeat to keep session active
    const heartbeatInterval = setInterval(() => {
      socket.emit('PING_HEARTBEAT');
    }, 30000);

    // Poll status initially
    fetchStatus();

    // Socket Event Handlers
    socket.on('GAME_OPENED', (gameData) => {
      setAvailableGame({
        gameId: gameData.gameId,
        title: gameData.title,
        type: gameData.type,
        status: 'OPEN',
        timeLimit: gameData.timeLimit,
        prize: gameData.prize,
        questionPreview: gameData.questionPreview
      });
      setGameState('GAME_AVAILABLE');
      setJoined(false);
      setSubmittedResult(null);
    });

    socket.on('GAME_STARTED', (data) => {
      setLiveQuestion(data.question);
      setGameState('COUNTDOWN');
      setCountdown(3);

      let timer = 3;
      const interval = setInterval(() => {
        timer -= 1;
        if (timer > 0) {
          setCountdown(timer);
        } else {
          clearInterval(interval);
          setCountdown(null);
          setGameState('QUESTION');
        }
      }, 1000);
    });

    socket.on('QUESTION_CHANGED', (data) => {
      setLiveQuestion(data.question);
      setSubmittedResult(null);
      setGameState('QUESTION');
    });

    socket.on('GAME_CLOSED', () => {
      setGameState('CLOSED');
    });

    socket.on('FORCE_LOGOUT_ALL', (data) => {
      reset();
      alert(data?.message || 'Session reset by Host.');
      navigate('/student');
    });

    return () => {
      clearInterval(heartbeatInterval);
      socket.off('GAME_OPENED');
      socket.off('GAME_STARTED');
      socket.off('QUESTION_CHANGED');
      socket.off('GAME_CLOSED');
      socket.off('FORCE_LOGOUT_ALL');
    };
  }, [profile]);

  const fetchStatus = async () => {
    if (!profile) return;
    try {
      const res = await axios.get(`/api/v1/student/status/${profile.studentId}`);
      if (res.data.success && res.data.data.availableGame) {
        setAvailableGame(res.data.data.availableGame);
        if (res.data.data.availableGame.hasJoined) setJoined(true);
        if (res.data.data.availableGame.status === 'OPEN') setGameState('GAME_AVAILABLE');
      }
    } catch (err) {
      // Silent catch
    }
  };

  const handleEnterGame = async () => {
    if (!availableGame || !profile) return;
    setJoining(true);
    try {
      const res = await axios.post(`/api/v1/games/${availableGame.gameId}/join`, {
        studentId: profile.studentId
      });
      if (res.data.success) {
        setJoined(true);
      }
    } catch (err) {
      // Silent handle
    } finally {
      setJoining(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {/* Student Token Card */}
      <TokenCard
        name={profile.name}
        tokenNo={profile.tokenNo}
        luckyNo={profile.luckyNo}
        spotlightNo={profile.spotlightNo}
      />

      {/* Main Game Status Portal */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Event Live</span>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
            Room: FRESHER2026
          </span>
        </div>

        {/* State 1: WAITING ROOM */}
        {gameState === 'WAITING' && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 text-purple-400 animate-pulse">
              <Hourglass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">⏳ WAITING FOR HOST</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                The next challenge will appear here automatically. Stay ready!
              </p>
            </div>
          </div>
        )}

        {/* State 2: GAME AVAILABLE (OPEN) */}
        {gameState === 'GAME_AVAILABLE' && availableGame && (
          <div className="space-y-4 py-2">
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded-full">
                🎮 GAME AVAILABLE
              </span>
              <h3 className="text-2xl font-black text-white mt-2">{availableGame.title}</h3>
              <p className="text-xs text-purple-300 mt-1">Time Limit: {availableGame.timeLimit}s | Prize: ₹{availableGame.prize}</p>
            </div>

            {!joined ? (
              <button
                onClick={handleEnterGame}
                disabled={joining}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{joining ? 'Joining...' : 'ENTER GAME'}</span>
              </button>
            ) : (
              <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl p-5 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-emerald-400 font-black text-base">
                  <CheckCircle className="w-5 h-5" />
                  <span>ENTERED: {availableGame.title}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-amber-300 text-xs font-bold bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/20">
                  <Hourglass className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Waiting for host to start the game...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 3: COUNTDOWN */}
        {gameState === 'COUNTDOWN' && (
          <div className="py-12 text-center space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-purple-300">GET READY...</span>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 animate-countdown">
              {countdown}
            </div>
          </div>
        )}

        {/* State 4: LIVE QUESTION PLAY */}
        {gameState === 'QUESTION' && <GameQuestionView />}

        {/* State 5: SUBMITTED */}
        {gameState === 'SUBMITTED' && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">✓ Answer Submitted</h3>
              <p className="text-xs text-slate-400 mt-1">Please wait for Management to review results!</p>
            </div>
          </div>
        )}

        {/* State 6: CLOSED */}
        {gameState === 'CLOSED' && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">⏰ TIME UP — GAME CLOSED</h3>
              <p className="text-xs text-slate-400 mt-1">Check the Auditorium screen for official winner announcement!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for Question & Options
const GameQuestionView: React.FC = () => {
  const { availableGame, liveQuestion, profile, setGameState, setSubmittedResult } = useStudentStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null || !availableGame || !profile) return;
    setSelectedOption(index);
    setSubmitting(true);

    try {
      const res = await axios.post('/api/v1/games/submit', {
        gameId: availableGame.gameId,
        selectedOptionIndex: index,
        studentId: profile.studentId
      });

      if (res.data.success) {
        setSubmittedResult(res.data.data);
        setGameState('SUBMITTED');
      }
    } catch (err: any) {
      setGameState('SUBMITTED');
    } finally {
      setSubmitting(false);
    }
  };

  if (!liveQuestion) return null;

  return (
    <div className="space-y-4">
      <div className="text-center py-3 bg-slate-900/90 border border-purple-500/30 rounded-xl">
        <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider mb-1">
          Question {liveQuestion.order ? `#${liveQuestion.order}` : ''}
        </h4>
        {liveQuestion.mediaContent && (
          <div className="text-3xl font-black py-2 tracking-widest text-amber-300">{liveQuestion.mediaContent}</div>
        )}
        <p className="text-sm font-bold text-white px-2">{liveQuestion.questionText}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {liveQuestion.options.map((option, idx) => (
          <button
            key={idx}
            disabled={submitting}
            onClick={() => handleOptionSelect(idx)}
            className={`w-full py-3.5 px-4 rounded-xl text-left text-sm font-bold transition-all flex items-center justify-between border ${
              selectedOption === idx
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40'
                : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:border-purple-500/50 hover:bg-slate-800'
            }`}
          >
            <span>{String.fromCharCode(65 + idx)}. {option}</span>
            <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">
              {selectedOption === idx ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
