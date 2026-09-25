import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagementStore } from '../../store/useManagementStore';
import { socket } from '../../sockets/socketClient';
import {
  Users,
  Gamepad2,
  Trophy,
  Ticket,
  Play,
  Square,
  CheckCircle,
  Tv,
  Sparkles,
  Star,
  RefreshCw,
  LogOut,
  Send,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    token,
    adminUser,
    metrics,
    currentGame,
    gameLibrary,
    winnerCandidate,
    setMetrics,
    setCurrentGame,
    setGameLibrary,
    setWinnerCandidate,
    logout
  } = useManagementStore();

  const [drawResult, setDrawResult] = useState<{ type: string; number: number; student: any } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [shuffleState, setShuffleState] = useState<{ isShuffling: boolean; currentNumber?: number | string; currentName?: string; currentToken?: number | string }>({ isShuffling: false });
  const [activeTab, setActiveTab] = useState<'control' | 'library' | 'auditorium'>('control');

  useEffect(() => {
    if (!token) {
      navigate('/management/login');
      return;
    }

    // Join management socket room
    socket.emit('JOIN_MANAGEMENT_ROOM', { eventId: 'FRESHER2026' });

    fetchDashboard();
    fetchLibrary();

    socket.on('METRICS_UPDATED', (data) => {
      setMetrics({
        totalStudents: data.totalStudents,
        onlineStudents: data.onlineStudents,
        totalGames: data.totalGames || 4,
        totalWinners: metrics.totalWinners,
        totalTokens: data.totalTokens || data.totalStudents
      });
    });

    socket.on('PARTICIPANT_JOINED', (data) => {
      fetchDashboard();
    });

    socket.on('SUBMISSION_RECEIVED', (data) => {
      fetchDashboard();
    });

    socket.on('WINNER_CANDIDATE', (data) => {
      if (data.winnerCandidate) {
        setWinnerCandidate(data.winnerCandidate);
      }
      fetchDashboard();
    });

    socket.on('WINNER_APPROVED', () => {
      fetchDashboard();
    });

    return () => {
      socket.off('METRICS_UPDATED');
      socket.off('PARTICIPANT_JOINED');
      socket.off('SUBMISSION_RECEIVED');
      socket.off('WINNER_CANDIDATE');
      socket.off('WINNER_APPROVED');
    };
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/v1/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMetrics(res.data.data.metrics);
        setCurrentGame(res.data.data.currentGame);
        if (res.data.data.winnerCandidate) {
          setWinnerCandidate(res.data.data.winnerCandidate);
        }
      }
    } catch (err) {
      // Handle expired token
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await axios.get('/api/v1/admin/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGameLibrary(res.data.data);
      }
    } catch (err) {}
  };

  const handleOpenGame = async (gameId: string) => {
    const selected = gameLibrary.find(g => g._id === gameId);
    // Instant 0ms Optimistic UI Update
    if (selected) {
      setCurrentGame({
        gameId: selected._id,
        title: selected.title,
        type: selected.type,
        status: 'OPEN',
        joinedCount: 0,
        totalSubmissions: 0,
        currentQuestionIndex: 0,
        totalQuestions: selected.totalQuestions || 3
      });
    }
    const element = document.getElementById('current-game-control');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    try {
      await axios.post(`/api/v1/admin/games/${gameId}/open`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to open game');
    }
  };

  const handleStartGame = async () => {
    if (!currentGame) return;
    // Instant 0ms Optimistic UI Update
    setCurrentGame({ ...currentGame, status: 'LIVE' });

    try {
      await axios.post(`/api/v1/admin/games/${currentGame.gameId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start game');
    }
  };

  const handleCloseGame = async () => {
    if (!currentGame) return;
    // Instant 0ms Optimistic UI Update
    setCurrentGame({ ...currentGame, status: 'CLOSED' });

    try {
      const res = await axios.post(`/api/v1/admin/games/${currentGame.gameId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (res.data.data.winnerCandidate) {
          setWinnerCandidate(res.data.data.winnerCandidate);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close game');
    }
  };

  const handleApproveWinner = async () => {
    if (!winnerCandidate) return;
    try {
      const res = await axios.post(`/api/v1/admin/winners/${winnerCandidate.winnerId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWinnerCandidate({ ...winnerCandidate, status: 'APPROVED' });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve winner');
    }
  };

  const handlePublishWinner = async () => {
    if (!winnerCandidate) return;
    try {
      await axios.post(`/api/v1/admin/winners/${winnerCandidate.winnerId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🎉 WINNER OFFICIAL PUBLISHED TO AUDITORIUM DISPLAY!');
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish winner');
    }
  };

  const handleDrawNumber = async (type: 'SPOTLIGHT' | 'LUCKY') => {
    setDrawing(true);
    setDrawResult(null);
    setShuffleState({ isShuffling: true, currentNumber: '...', currentName: 'Shuffling active users...', currentToken: '...' });

    try {
      const res = await axios.post('/api/v1/admin/draw-number', { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const { number, student, candidates } = res.data.data;
        const candidateList = candidates && candidates.length > 0
          ? candidates
          : [{ name: student.name, tokenNo: student.tokenNo, number }];

        let count = 0;
        const interval = setInterval(() => {
          const randIndex = Math.floor(Math.random() * candidateList.length);
          const item = candidateList[randIndex];
          setShuffleState({
            isShuffling: true,
            currentNumber: item.number,
            currentName: item.name,
            currentToken: item.tokenNo
          });
          count++;
          if (count >= 35) {
            clearInterval(interval);
            setShuffleState({ isShuffling: false });
            setDrawResult({
              type,
              number,
              student
            });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setDrawing(false);
          }
        }, 60);
      } else {
        setShuffleState({ isShuffling: false });
        setDrawing(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Draw failed');
      setShuffleState({ isShuffling: false });
      setDrawing(false);
    }
  };

  const handlePushAuditoriumState = async (state: string, payload: any = {}) => {
    try {
      await axios.post('/api/v1/admin/auditorium/state', { state, payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Pushed state '${state}' to Auditorium!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update auditorium state');
    }
  };

  const handleResetAllStudents = async () => {
    if (!window.confirm('⚠️ ARE YOU SURE? This will log out ALL active students immediately, clear all token numbers, and purge student database records!')) {
      return;
    }
    try {
      const res = await axios.post('/api/v1/admin/reset-students', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('✅ ALL STUDENTS LOGGED OUT & PURGED SUCCESSFULLY!');
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset student sessions');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Dashboard Banner */}
      <div className="glass-card rounded-2xl p-5 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-white">FRESHER CONTROL PANEL</span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Host: {adminUser}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live Management Operating System — Real-time event & audience synchronization</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleResetAllStudents}
            className="p-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-900/30"
            title="Log out all active students and purge all student database records"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset All Students</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/management/login'); }}
            className="p-2.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        <div className="glass-card rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase">Students</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalStudents}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase">Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{metrics.onlineStudents}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase">Games</span>
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalGames}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase">Winners</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300">{metrics.totalWinners}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-pink-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-pink-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase">Tokens</span>
            <Ticket className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalTokens}</div>
        </div>
      </div>

      {/* Main Control Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Game & Winner Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* CURRENT ACTIVE GAME CONTROL BOX */}
          <div id="current-game-control" className="glass-card rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">CURRENT GAME CONTROL</h3>
              </div>
              {currentGame ? (
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  currentGame.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  Status: {currentGame.status}
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 text-xs font-bold px-3 py-1 rounded-full">No Game Open</span>
              )}
            </div>

            {currentGame ? (
              <div className="space-y-4">
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xl font-extrabold text-white">{currentGame.title}</h4>
                      <span className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        Q{(currentGame.currentQuestionIndex || 0) + 1} of {currentGame.totalQuestions || 1}
                      </span>
                    </div>
                    <span className="text-xs text-purple-300 font-semibold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30 inline-block mt-1">
                      Type: {currentGame.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-center">
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Players</span>
                      <span className="text-lg font-black text-emerald-400">{currentGame.joinedCount || 0}</span>
                    </div>
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Submissions</span>
                      <span className="text-lg font-black text-cyan-400">{currentGame.totalSubmissions || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Game Action Buttons: START, NEXT QUESTION, CLOSE */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    disabled={currentGame.status === 'LIVE'}
                    onClick={handleStartGame}
                    className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>START GAME</span>
                  </button>

                  <button
                    disabled={!currentGame || currentGame.status !== 'LIVE' || (currentGame.currentQuestionIndex + 1 >= currentGame.totalQuestions)}
                    onClick={async () => {
                      try {
                        await axios.post(`/api/v1/admin/games/${currentGame.gameId}/next-question`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        alert('⏩ NEXT QUESTION RELEASED TO STUDENTS!');
                        fetchDashboard();
                      } catch (err: any) {
                        alert(err.response?.data?.error || 'Failed to release next question');
                      }
                    }}
                    className="py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-40"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>NEXT QUESTION</span>
                  </button>

                  <button
                    disabled={currentGame.status === 'CLOSED'}
                    onClick={handleCloseGame}
                    className="py-3.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-40"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>CLOSE GAME</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <p className="text-sm font-semibold">Select a game from the library below to OPEN for students.</p>
              </div>
            )}
          </div>

          {/* WINNER REVIEW & APPROVAL BOARD */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-center space-x-2 mb-4 border-b border-amber-500/20 pb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">WINNER REVIEW & APPROVAL</h3>
            </div>

            {winnerCandidate ? (
              <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Candidate Winner</span>
                    <h4 className="text-2xl font-black text-white mt-1">{winnerCandidate.name || winnerCandidate.studentId?.name}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Token #{winnerCandidate.tokenNo || winnerCandidate.studentId?.tokenNo} | Enrollment: {winnerCandidate.enrollmentNo || winnerCandidate.studentId?.enrollmentNo}
                    </p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-400/40">
                    Response: {((winnerCandidate.responseTimeMs || 0) / 1000).toFixed(2)}s
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Correct Answer: <strong className="text-emerald-400">{winnerCandidate.correctAnswer || winnerCandidate.selectedAnswerText || 'B — Lion King'}</strong></span>
                  <span className="text-emerald-400 font-bold">✅ Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleApproveWinner}
                    disabled={winnerCandidate.status === 'APPROVED' || winnerCandidate.status === 'PUBLISHED'}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{winnerCandidate.status === 'APPROVED' ? 'APPROVED' : 'APPROVE WINNER'}</span>
                  </button>

                  <button
                    onClick={handlePublishWinner}
                    disabled={winnerCandidate.status !== 'APPROVED'}
                    className="py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>PUBLISH TO AUDITORIUM</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No winner candidate currently pending review.</p>
            )}
          </div>
        </div>

        {/* Right 1 Column: Token Draw & Auditorium Overrides */}
        <div className="space-y-6">
          {/* TOKEN DRAW TOOL (SPOTLIGHT & LUCKY NUMBER) */}
          <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-4">
            <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">TOKEN DRAW TOOL</h3>
            </div>

            <p className="text-xs text-slate-300">Randomly select stage participants using Spotlight or Lucky Numbers.</p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                disabled={drawing}
                onClick={() => handleDrawNumber('SPOTLIGHT')}
                className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Star className="w-4 h-4" />
                <span>DRAW SPOTLIGHT NUMBER</span>
              </button>

              <button
                disabled={drawing}
                onClick={() => handleDrawNumber('LUCKY')}
                className="py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>DRAW LUCKY NUMBER</span>
              </button>
            </div>

            {shuffleState.isShuffling && (
              <div className="bg-slate-900 border-2 border-cyan-400 rounded-xl p-4 text-center space-y-2 animate-pulse shadow-lg shadow-cyan-500/30">
                <div className="flex items-center justify-center space-x-2 text-cyan-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    🎲 SHUFFLING ACTIVE ENTERED USERS ONLY...
                  </span>
                </div>
                <div className="text-5xl font-black text-amber-300 tracking-wider py-1 font-mono">
                  #{shuffleState.currentNumber}
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {shuffleState.currentName} {shuffleState.currentToken !== '...' && `(Token #${shuffleState.currentToken})`}
                </div>
              </div>
            )}

            {!shuffleState.isShuffling && drawResult && (
              <div className="bg-slate-900 border border-emerald-500/60 rounded-xl p-4 text-center space-y-2 shadow-xl shadow-emerald-500/20 animate-countdown">
                <div className="flex items-center justify-center space-x-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SELECTED ACTIVE {drawResult.type} PARTICIPANT</span>
                </div>
                <div className="text-5xl font-black text-amber-300 py-1 font-mono glow-gold">
                  #{drawResult.number}
                </div>
                <div className="text-sm font-extrabold text-white">
                  Student: <span className="text-cyan-300">{drawResult.student?.name}</span>
                </div>
                <div className="inline-block bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold px-3 py-0.5 rounded-full">
                  Token #{drawResult.student?.tokenNo} • Enrollment #{drawResult.student?.enrollmentNo}
                </div>
              </div>
            )}
          </div>

          {/* AUDITORIUM QUICK OVERRIDES */}
          <div className="glass-card rounded-2xl p-6 border border-pink-500/30 space-y-4">
            <div className="flex items-center space-x-2 border-b border-pink-500/20 pb-3">
              <Tv className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">AUDITORIUM OVERRIDES</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handlePushAuditoriumState('WELCOME', { title: '🎉 WELCOME FRESHERS 2026' })}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold transition-all text-center"
              >
                Welcome
              </button>
              <button
                onClick={() => handlePushAuditoriumState('WAITING')}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold transition-all text-center"
              >
                Waiting Room
              </button>
              <button
                onClick={() => handlePushAuditoriumState('NEXT_GAME', { title: '🎵 Finish the Lyrics' })}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold transition-all text-center"
              >
                Next Game
              </button>
              <button
                onClick={() => handlePushAuditoriumState('GAME_CLOSED')}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold transition-all text-center"
              >
                Game Closed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GAME LIBRARY LIST */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">GAME LIBRARY</h3>
          <span className="text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full">
            {gameLibrary.length} Games Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameLibrary.map((g) => (
            <div
              key={g._id}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                  {g.type}
                </span>
                <h4 className="text-base font-extrabold text-white mt-2">{g.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{g.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-amber-300 font-extrabold">Prize: ₹{g.prize}</span>
                <button
                  onClick={() => handleOpenGame(g._id)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg shadow-md transition-all"
                >
                  OPEN GAME
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
