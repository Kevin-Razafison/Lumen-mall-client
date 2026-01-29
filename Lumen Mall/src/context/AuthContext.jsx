import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lumenUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Make sure the names here (data.token, data.user) match your Backend response!
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        // This catches 401 Unauthorized or 403 Forbidden
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("Login Context Error:", error);
      // This is what triggers your "Check Connection" message
      throw error; 
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumenUser');
  };

    return (
        <AuthContext.Provider value={{ 
          user, 
          setUser, // <--- ADD THIS LINE
          login, 
          logout, 
          isAuthenticated: !!user 
        }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);