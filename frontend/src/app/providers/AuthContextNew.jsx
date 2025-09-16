import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContextDef";
import { 
  loginUser, 
  logoutUser, 
  verifyToken, 
  getAuthState, 
  getAllUsersFromDB, 
  updateUserStatusInDB,
  deleteUserFromDB,
  createAdminUser,
  getAuthToken
} from "../services/authService";

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState("active");
  const [users, setUsers] = useState([]); // Store users from database

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { authStatus, userData } = getAuthState();
        
        if (authStatus && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Verify token with backend
          try {
            await verifyToken();
            setIsAuthenticated(true);
            setUser(parsedUser);
            setUserStatus(parsedUser.status || "active");
          } catch (error) {
            console.error("🔐 Token verification failed:", error);
            // Clear invalid auth state
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("userData");
            setIsAuthenticated(false);
            setUser(null);
            setUserStatus("active");
          }
        } else {
          // No auth state found
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("userData");
          setIsAuthenticated(false);
          setUser(null);
          setUserStatus("active");
        }
      } catch (error) {
        console.error("🔐 Auth check error:", error);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUser(null);
        setUserStatus("active");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);

      // Use backend API for authentication
      const { user, token } = await loginUser(username, password);

      setIsAuthenticated(true);
      setUser(user);
      setUserStatus(user.status || "active");

      return user;
    } catch (error) {
      console.error("🔐 Login error:", error);
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
      setUserStatus("active");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("🔐 Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUserStatus("active");
      setLoading(false);
    }
  };

  // Function to check user access
  const checkUserAccess = (requiredRole) => {
    if (!user) return false;
    
    // Owner has access to everything
    if (user.role === 'owner') return true;
    
    // Check specific role requirements
    if (requiredRole === 'admin' && user.role === 'admin') return true;
    if (requiredRole === 'user' && (user.role === 'user' || user.role === 'admin')) return true;
    
    return false;
  };

  // Function to get all users from database
  const getAllUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const usersData = await getAllUsersFromDB(token);
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Function to update user status
  const updateUserStatus = async (userId, status, reason = null, blockedBy = null) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      await updateUserStatusInDB(userId, status, reason, token);
      
      // Update local users state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                status, 
                is_blocked: status === "blocked",
                blocked_by: status === "blocked" ? blockedBy : null,
                blocked_at: status === "blocked" ? new Date().toISOString() : null,
                blocked_reason: status === "blocked" ? reason : null
              }
            : user
        )
      );

      // If the current user is being blocked, log them out
      if (user && user.id === userId && status === "blocked") {
        logout();
      }

      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  // Function to delete user
  const deleteUser = async (username) => {
    try {
      console.log('🔄 Deleting user:', username);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Delete user from database
      await deleteUserFromDB(username, token);
      console.log('✅ User deleted from database successfully');

      // Update local users state
      setUsers(prevUsers => prevUsers.filter(user => user.username !== username));

      // Logout the user if they are being deleted
      if (user && user.username === username) {
        logout();
      }

      console.log('✅ User deleted successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  };

  // Function to add a new admin with business
  const addNewAdminWithBusiness = async (adminData) => {
    try {
      console.log('🔄 Adding new admin with business:', adminData);
      
      const { firstName, lastName, email, phone, businessName, businessType, businessAddress, businessPhone, businessEmail } = adminData;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !businessName) {
        throw new Error('Missing required fields: firstName, lastName, email, businessName');
      }
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Create admin user in the database via API
      const result = await createAdminUser({
        firstName,
        lastName,
        email,
        phone,
        businessName,
        businessType,
        businessAddress,
        businessPhone,
        businessEmail
      }, token);
      
      console.log('✅ Admin created in database:', result);
      
      // Refresh users list
      await getAllUsers();
      
      return result;
      
    } catch (error) {
      console.error('❌ Error adding new admin with business:', error);
      throw error;
    }
  };

  // Function to add a new user
  const addNewUser = async (userData) => {
    try {
      console.log('🔄 Adding new user:', userData);
      
      // This would need to be implemented in the backend
      // For now, we'll throw an error indicating it's not implemented
      throw new Error('Adding regular users is not yet implemented in the database version');
      
    } catch (error) {
      console.error('❌ Error adding new user:', error);
      throw error;
    }
  };

  // Function to get users for a specific business
  const getBusinessUsers = (businessId) => {
    try {
      console.log('🔄 Getting users for business:', businessId);
      
      const businessUsers = users.filter(user => 
        user.business_id === businessId
      );
      
      console.log('✅ Found business users:', businessUsers.length);
      return businessUsers;
      
    } catch (error) {
      console.error('❌ Error getting business users:', error);
      return [];
    }
  };

  // Function to get sub-users managed by an admin
  const getSubUsers = (adminUsername) => {
    try {
      console.log('🔄 Getting sub-users for admin:', adminUsername);
      
      const admin = users.find(user => user.username === adminUsername && user.role === 'admin');
      if (!admin) {
        return [];
      }
      
      // This would need to be implemented based on your business logic
      // For now, return empty array
      console.log('✅ Found sub-users:', 0);
      return [];
      
    } catch (error) {
      console.error('❌ Error getting sub-users:', error);
      return [];
    }
  };

  // Function to check if user has access to business data
  const hasBusinessAccess = (user, businessId) => {
    try {
      if (!user || !businessId) return false;
      
      // Owner has access to all businesses
      if (user.role === 'owner') return true;
      
      // Admin has access to their own business
      if (user.role === 'admin' && user.business_id === businessId) return true;
      
      // Sub-user has access to their assigned business
      if (user.business_id === businessId) return true;
      
      return false;
      
    } catch (error) {
      console.error('❌ Error checking business access:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    userStatus,
    checkUserAccess,
    updateUserStatus,
    deleteUser,
    getAllUsers,
    addNewUser,
    addNewAdminWithBusiness,
    getBusinessUsers,
    getSubUsers,
    hasBusinessAccess,
    users // Expose users state for components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth };
