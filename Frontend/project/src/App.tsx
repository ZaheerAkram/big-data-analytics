import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import ScoreScreen from './pages/ScoreScreen';
import AdminDashboard from './pages/AdminDashboard';
import CandidateStatus from './pages/CandidateStatus';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview/:sessionId" element={<Interview />} />
            <Route path="/score/:sessionId" element={<ScoreScreen />} />
            <Route path="/status" element={<CandidateStatus />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* Redirect and Not Found */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    // </AuthProvider>
  );
}

export default App;