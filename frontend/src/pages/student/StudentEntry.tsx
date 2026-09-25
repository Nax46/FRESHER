import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/useStudentStore';
import { QrCode, User, Hash, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

export const StudentEntry: React.FC = () => {
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setProfile = useStudentStore((state) => state.setProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !enrollmentNo.trim()) {
      setError('Please enter both Full Name and Enrollment Number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storedProfile = JSON.parse(localStorage.getItem('fresher_student_profile') || 'null');
      const res = await axios.post('/api/v1/event/enter', {
        name: name.trim(),
        enrollmentNo: enrollmentNo.trim(),
        sessionId: storedProfile?.sessionId
      });

      if (res.data.success) {
        setProfile(res.data.data);
        navigate('/student/arena');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Light Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-xl shadow-purple-500/30 mb-2 glow-purple">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">🎉 FRESHER 2026</h1>
          <p className="text-sm font-bold text-purple-300">Welcome to the Live Game Arena Operating System</p>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-purple-500/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 focus:border-purple-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Enrollment Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4 text-pink-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. EN2026047"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 focus:border-purple-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all uppercase shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/35 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Session...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ENTER EVENT ARENA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

