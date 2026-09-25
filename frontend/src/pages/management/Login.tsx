import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagementStore } from '../../store/useManagementStore';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useManagementStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/v1/admin/login', { username, password });
      if (res.data.success) {
        setAuth(res.data.data.token, res.data.data.username);
        navigate('/management/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Glow Background */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-xl shadow-indigo-500/35 mb-2 glow-purple">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">HOST MANAGEMENT PANEL</h1>
          <p className="text-sm font-bold text-indigo-300">Fresher Event Control Operations & Live Arena Sync</p>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-indigo-500/30">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 focus:border-indigo-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 focus:border-indigo-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/35 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'ACCESS CONTROL PANEL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

