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
      const res = await axios.post('/api/v1/event/enter', {
        name: name.trim(),
        enrollmentNo: enrollmentNo.trim()
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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-xl shadow-purple-500/30 mb-2">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">🎉 FRESHER 2026</h1>
          <p className="text-sm font-semibold text-purple-300">Welcome to the Live Game Arena</p>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nax Chaudhari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-purple-500 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Enrollment Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. EN2026047"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-purple-500 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Session...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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
