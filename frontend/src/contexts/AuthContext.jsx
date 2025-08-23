import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth';
import api from '@utils/api';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password }, { withCredentials: true });
    const userData = response.data.user;
    localStorage.setItem('isAuthenticated', 'true');
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await api.post('/api/auth/logout', {}, { withCredentials: true });
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
