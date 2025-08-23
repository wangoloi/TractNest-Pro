import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
  </ErrorBoundary>
);
