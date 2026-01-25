import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage so they stay logged in on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lumenUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('lumenUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumenUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);