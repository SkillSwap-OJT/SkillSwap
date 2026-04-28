import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import ExamPage from './pages/ExamPage';
import MatchPage from './pages/MatchPage';
import SessionPage from './pages/SessionPage';
import SessionsPage from './pages/SessionsPage';
import RequestsPage from './pages/RequestsPage';
import OnboardingPage from './pages/OnboardingPage';
import UserProfilePage from './pages/UserProfilePage';
import GlobalNotificationHandler from './components/GlobalNotificationHandler';

const LoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg-primary)',
    }}
  >
    <div
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span>⚡</span> SkillSwap
    </div>
    <div className="spinner" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
        <Route path="/exam/:skillId" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/session/:id" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalNotificationHandler />
    </Router>
  );
}

export default App;
