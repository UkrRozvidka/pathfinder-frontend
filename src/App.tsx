import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { theme } from './theme';
import RegisterPage from './pages/RegisterPage';
import HikesPage from './pages/HikesPage';
import CreateHikePage from './pages/CreateHikePage';
import EditHikePage from './pages/EditHikePage';
import HikeDetailsPage from './pages/HikeDetailsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
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
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
