import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HikesPage from './pages/HikesPage';
import CreateHikePage from './pages/CreateHikePage';
import EditHikePage from './pages/EditHikePage';
import HikeDetailsPage from './pages/HikeDetailsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HikesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hikes/create"
        element={
          <ProtectedRoute>
            <CreateHikePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hikes/:id"
        element={
          <ProtectedRoute>
            <HikeDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hikes/:id/edit"
        element={
          <ProtectedRoute>
            <EditHikePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Router; 