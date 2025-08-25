import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
=======
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
<<<<<<< HEAD
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
=======
    <App />
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
  </ErrorBoundary>
);
