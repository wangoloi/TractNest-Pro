import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthContext';
import { MessageProvider } from './app/providers/MessageContext';
import { CurrencyProvider } from './app/providers/CurrencyContext';
import { ThemeProvider } from './app/providers/ThemeContext';
import AppRoutes from './app/routes/SimplifiedRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MessageProvider>
            <CurrencyProvider>
                             <Router>
                 <AppRoutes />
                 <ToastContainer 
                   position="top-right" 
                   autoClose={3000} 
                   hideProgressBar={false}
                   newestOnTop={false}
                   closeOnClick
                   rtl={false}
                   pauseOnFocusLoss
                   draggable
                   pauseOnHover
                 />
               </Router>
            </CurrencyProvider>
          </MessageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
