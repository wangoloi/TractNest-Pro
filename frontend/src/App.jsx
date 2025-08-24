import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';

// Routes
import AppRoutes from './routes';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { MessageProvider } from './contexts/MessageContext';



function AppContent() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('🔄 App useEffect triggered:', { isAuthenticated, user, authLoading });
    
    // Wait for authentication to complete
    if (authLoading) {
      console.log('🔄 Auth still loading, waiting...');
      return;
    }
    
    // Don't fetch data if not authenticated
    if (!isAuthenticated || !user) {
      console.log('🔄 User not authenticated, skipping data fetch');
      setLoading(false);
      return;
    }

    console.log('🔄 Fetching application data...');
    setLoading(true);
    
    const fetchData = async () => {
      try {
        console.log('🔄 Loading mock data for stock items');
        // Mock data for stock items
        const mockStockItems = [
          { id: 1, name: 'Laptop Pro', quantity: 15, price: 1200 },
          { id: 2, name: 'Smartphone X', quantity: 25, price: 800 },
          { id: 3, name: 'Tablet Air', quantity: 8, price: 500 },
          { id: 4, name: 'Wireless Headphones', quantity: 30, price: 150 },
          { id: 5, name: 'Gaming Mouse', quantity: 12, price: 80 }
        ];
        setStockItems(mockStockItems);
      } catch (error) {
        console.error('❌ Error loading mock data:', error);
        setStockItems([]);
      } finally {
        console.log('🔄 Setting loading to false');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Loading timeout - setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    fetchData();

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, authLoading]);

  if (loading) {
    console.log('🔄 App is loading...', { isAuthenticated, loading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TrackNest Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <AppRoutes stockItems={stockItems} />
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;
