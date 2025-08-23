import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Info, CheckCircle, Wifi, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '@utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }
    
    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }
    
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Login successful! Welcome to TrackNest Pro');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };



  const testConnection = async () => {
    try {
      const response = await api.get('/health');
      toast.success(`✅ Backend connected! Status: ${response.data.status}`);
      console.log('Backend response:', response.data);
    } catch (error) {
      toast.error(`❌ Backend connection failed: ${error.message}`);
      console.error('Connection test failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4 shadow-lg">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              TrackNest Pro
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="text-blue-600 mr-2" size={20} />
                <span className="text-sm font-medium text-blue-800">Demo Account</span>
              </div>
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showCredentials ? 'Hide' : 'Show'} Credentials
              </button>
            </div>
            {showCredentials && (
              <div className="mt-3 space-y-3">
                <div className="border-b border-gray-200 pb-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Demo Admin Account:</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">password</span>
                  </div>
                  <button
                    onClick={() => { setUsername('admin'); setPassword('password'); }}
                    className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Load Demo Credentials
                  </button>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Main Admin Account:</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">bachawa</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">bachawa123</span>
                  </div>
                  <button
                    onClick={() => { setUsername('bachawa'); setPassword('bachawa123'); }}
                    className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Load Bachawa Credentials
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400" size={20} />
                  ) : (
                    <Eye className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  Sign in
                </span>
              )}
            </button>
          </form>

          {/* Account Type Selection */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Account Types</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/register/customer"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <UserPlus className="text-gray-600 group-hover:text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Customer Account
                </span>
              </Link>
              
              <button
                onClick={() => toast.info('Admin accounts are created by system administrators. Please contact your admin for access.')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Lock className="text-gray-600 group-hover:text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Admin Account
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register/customer" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Register as Customer
              </Link>
            </p>
          </div>

          {/* Connection Test */}
          <div className="mt-4 text-center">
            <button
              onClick={testConnection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Wifi size={16} />
              Test Backend Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
