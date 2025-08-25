import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

<<<<<<< HEAD
const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }) => {
=======
const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false, ownerOnly = false }) => {
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

<<<<<<< HEAD
  // If route requires admin but user is not admin
  if (adminOnly && user?.role !== 'admin') {
=======
  // If route requires owner but user is not owner
  if (ownerOnly && user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  // If route requires admin but user is not admin (and not owner)
  if (adminOnly && user?.role !== 'admin' && user?.role !== 'owner') {
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
