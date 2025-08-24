import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';

// Routes
import AppRoutes from './routes';

// API Utility
import api from './utils/api';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';



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
        console.log('🔄 Making API call to /api/inventory');
        const inventoryRes = await api.get('/api/inventory');
        console.log('🔄 Inventory response:', inventoryRes.data);
        setStockItems(inventoryRes.data || []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Don't fail completely, just set empty data
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
    </AuthProvider>
  );
}

export default App;
