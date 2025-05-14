import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../services/api';
import { AuthDTO } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  userName: string | null;
  login: (data: AuthDTO) => Promise<void>;
  register: (data: AuthDTO) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setIsAuthenticated(true);
        setUserId(response.data.id);
        setUserName(response.data.userName);
      } catch (error) {
        console.log('Not authenticated');
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (data: AuthDTO) => {
    try {
      await authApi.login(data);
      // After successful login, get user info
      const userResponse = await authApi.getCurrentUser();
      setIsAuthenticated(true);
      setUserId(userResponse.data.id);
      setUserName(userResponse.data.userName);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: AuthDTO) => {
    try {
      await authApi.register(data);
      // After successful registration, log the user in
      await login(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setUserId(null);
      setUserName(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const value = {
    isAuthenticated,
    userId,
    userName,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 