import React, { useState, useEffect } from 'react';
import api from '@utils/api';
import { AuthContext } from './AuthContextDef';

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('userData');
    console.log('🔐 Auth Check:', { authStatus, userData });
    
    try {
      setIsAuthenticated(authStatus);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('🔐 User loaded:', parsedUser);
      }
    } catch (error) {
      console.error('🔐 Error parsing user data:', error);
      // Clear corrupted data
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Login attempt:', { username });
      setLoading(true);
      const response = await api.post('/api/auth/login', { username, password }, { withCredentials: true });
      console.log('🔐 Login response:', response.data);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      setUser(response.data.user);
      console.log('🔐 Login successful:', response.data.user);
    } catch (error) {
      console.error('🔐 Login error:', error);
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
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
