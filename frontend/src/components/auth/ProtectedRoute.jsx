import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false, ownerOnly = false }) => {
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

  // If route requires owner but user is not owner
  if (ownerOnly && user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  // If route requires admin but user is not admin (and not owner)
  if (adminOnly && user?.role !== 'admin' && user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
