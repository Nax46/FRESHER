import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StudentEntry } from './pages/student/StudentEntry';
import { StudentArena } from './pages/student/StudentArena';
import { Login as ManagementLogin } from './pages/management/Login';
import { Dashboard as ManagementDashboard } from './pages/management/Dashboard';
import { AuditoriumDisplay } from './pages/auditorium/AuditoriumDisplay';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/student/arena" element={<StudentArena />} />
            <Route path="/management" element={<Navigate to="/management/dashboard" replace />} />
            <Route path="/management/login" element={<ManagementLogin />} />
            <Route path="/management/dashboard" element={<ManagementDashboard />} />
            <Route path="/auditorium" element={<AuditoriumDisplay />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
