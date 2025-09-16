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
    console.log('🚀 API Request: Creating admin user with data:', adminData);
    console.log('🔑 Using token:', token ? 'Token provided' : 'No token');
    console.log('📋 Data validation:', {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      businessName: adminData.businessName,
      hasFirstName: !!adminData.firstName,
      hasLastName: !!adminData.lastName,
      hasEmail: !!adminData.email,
      hasBusinessName: !!adminData.businessName
    });
    
    const response = await api.post('/users/create-admin', adminData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response: Admin user created successfully');
    return response.data;
  } catch (error) {
    console.error('❌ API Error: Failed to create admin user:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Full error object:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Only owners can create admin users.');
    } else if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid data provided.';
      console.error('❌ 400 Error details:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection and ensure the backend server is running.');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to create admin user');
  }
};

// Delete user from database by username
export const deleteUserFromDB = async (username, token) => {
  try {
    const response = await api.delete(`/users/username/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('User not found in database');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Only owners can delete users.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || 'Cannot delete this user');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to delete user');
  }
};

// Get all users from database
export const getAllUsersFromDB = async (token) => {
  try {
    const response = await api.get('/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

// Update user status in database
export const updateUserStatusInDB = async (userId, status, reason, token) => {
  try {
    const response = await api.patch(`/users/${userId}/status`, {
      status,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error(error.response?.data?.error || 'Failed to update user status');
  }
};

// Update user details in database
export const updateUserDetailsInDB = async (username, userDetails, token) => {
  try {
    console.log('🔄 Updating user details for:', username, 'with data:', userDetails);
    
    const response = await api.patch(`/users/username/${username}`, userDetails, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User details updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error updating user details:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('User not found in database');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to update this user.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || 'Invalid data provided for user update');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to update user details');
  }
};

// Add sub-user to business
export const addSubUserToBusinessInDB = async (businessId, userData, token) => {
  try {
    console.log('🔄 Adding sub-user to business:', businessId, 'with data:', userData);
    
    const response = await api.post(`/users/business/${businessId}/sub-user`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Sub-user added to business successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error adding sub-user to business:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Business not found in database');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to add users to this business.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || 'Invalid data provided for sub-user creation');
    }
    
    throw new Error(error.response?.data?.error || 'Failed to add sub-user to business');
  }
};
