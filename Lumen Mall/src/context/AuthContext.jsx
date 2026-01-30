import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added this
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // Initialize the hook
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lumenUser');
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("AuthContext: Error parsing saved user:", error);
      localStorage.removeItem('lumenUser');
    }
    return null;
  });

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('lumenUser');
        if (!savedUser) {
          setUser(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || "Invalid credentials." 
        };
      }

      const data = await response.json();
      const userData = { 
        id: data.id, 
        email: data.email, 
        fullName: data.fullName || data.email.split('@')[0],
        role: data.role || 'ROLE_USER' 
      };

      localStorage.setItem('lumenToken', data.token);
      localStorage.setItem('lumenUser', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return { success: false, message: "Server timeout. Please try again." };
      }
      return { success: false, message: "Network error. Connection failed." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumenToken');
    localStorage.removeItem('lumenUser');
    
    // Redirect using useNavigate instead of window.location
    navigate('/login');
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem('lumenUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateUser, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ROLE_ADMIN' 
    }}>
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