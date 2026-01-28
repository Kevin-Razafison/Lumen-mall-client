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
        body: JSON.stringify({ email, password })
      });

      const data = await response.json(); // Always parse the JSON to get messages

      if (response.ok) {
        const userWithToken = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          token: data.token 
        };
        
        setUser(userWithToken);
        localStorage.setItem('lumenUser', JSON.stringify(userWithToken));
        return { success: true }; // Return object
      } else {
        // Return the specific message from the Backend (e.g., "Please verify your email first!")
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Could not connect to server" };
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