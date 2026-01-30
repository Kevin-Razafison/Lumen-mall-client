import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lumenUser');
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Error parsing saved user:", error);
      localStorage.removeItem('lumenUser');
    }
    return null;
  });

  // Sync user state when storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('lumenUser');
        if (!savedUser || savedUser === "undefined" || savedUser === "null") {
          setUser(null);
        } else {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || "Invalid credentials. Please try again." 
        };
      }

      const data = await response.json();

      // Validate response data
      if (!data.token || !data.email) {
        return { 
          success: false, 
          message: "Invalid server response. Please try again." 
        };
      }

      // Store user data
      const userData = { 
        id: data.id, 
        email: data.email, 
        fullName: data.fullName || data.email.split('@')[0],
        role: data.role || 'ROLE_USER'
      };

      try {
        localStorage.setItem('lumenToken', data.token);
        localStorage.setItem('lumenUser', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } catch (storageError) {
        console.error("Storage error:", storageError);
        return { 
          success: false, 
          message: "Could not save login data. Please check browser settings." 
        };
      }

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return { 
          success: false, 
          message: "Request timeout. Server is taking too long to respond." 
        };
      }

      if (error.message && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: "Network error. Please check your internet connection." 
        };
      }

      console.error("Login error:", error);
      return { 
        success: false, 
        message: "An unexpected error occurred. Please try again." 
      };
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('lumenToken');
      localStorage.removeItem('lumenUser');
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear even if there's an error
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('lumenUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const value = {
    user,
    setUser: updateUser,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
