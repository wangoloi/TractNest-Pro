import React, { useState, useEffect, createContext, useContext } from 'react';
import api from '@utils/api';

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('userData');
    setIsAuthenticated(authStatus);
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', { username, password }, { withCredentials: true });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      // Clear any existing authentication state on login failure
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
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
