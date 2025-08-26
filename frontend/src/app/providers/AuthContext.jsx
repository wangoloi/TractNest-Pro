import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContextDef";

// Hardcoded credentials for frontend authentication
const HARDCODED_USERS = {
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    email: "admin@tracknest.com",
  },
  user: {
    username: "user",
    password: "user123",
    role: "user",
    name: "Regular User",
    email: "user@tracknest.com",
  },
  bachawa: {
    username: "bachawa",
    password: "bachawa",
    role: "owner",
    name: "Bachawa - TrackNest Pro Owner",
    email: "bachawa@tracknest.com",
  },
};

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

  useEffect(() => {
    // Check if user is authenticated on app load
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const userData = localStorage.getItem("userData");
    console.log("🔐 Auth Check:", { authStatus, userData });

    try {
      setIsAuthenticated(authStatus);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("🔐 User loaded:", parsedUser);
      }
    } catch (error) {
      console.error("🔐 Error parsing user data:", error);
      // Clear corrupted data
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log("🔐 Login attempt:", { username });
      console.log("🔐 Available users:", Object.keys(HARDCODED_USERS));
      setLoading(true);

      // Check against hardcoded credentials
      const user = HARDCODED_USERS[username];

      if (!user) {
        console.log("🔐 User not found:", username);
        throw new Error("Invalid username or password");
      }

      if (user.password !== password) {
        console.log("🔐 Password mismatch for user:", username);
        throw new Error("Invalid username or password");
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userData", JSON.stringify(userWithoutPassword));
      setIsAuthenticated(true);
      setUser(userWithoutPassword);
      console.log("🔐 Login successful:", userWithoutPassword);

      return userWithoutPassword;
    } catch (error) {
      console.error("🔐 Login error:", error);
      // Clear any existing authentication state on login failure
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // For frontend-only auth, we don't need to call any API
      console.log("🔐 Logging out user");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if there's an error
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth };
