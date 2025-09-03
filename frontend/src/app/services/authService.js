import api from '../../lib/utils/api.js';

// Authentication service functions

// Function to login user
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    const { token, user } = response.data;

    // Save authentication state
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userData", JSON.stringify({ ...user, token }));

    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Function to register new user (owner only)
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Function to verify token
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

// Function to logout user
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear authentication state regardless of API call success
    clearAuthState();
  }
};

// Function to save authentication state
export const saveAuthState = (userWithoutPassword) => {
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userData", JSON.stringify(userWithoutPassword));
};

// Function to clear authentication state
export const clearAuthState = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userData");
};

// Function to get authentication state
export const getAuthState = () => {
  const authStatus = localStorage.getItem("isAuthenticated") === "true";
  const userData = localStorage.getItem("userData");
  
  return { authStatus, userData };
};

// Function to get auth token
export const getAuthToken = () => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      return user.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create admin user with business
export const createAdminUser = async (adminData, token) => {
  try {
    const response = await api.post('/users/create-admin', adminData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw new Error(error.response?.data?.error || 'Failed to create admin user');
  }
};
