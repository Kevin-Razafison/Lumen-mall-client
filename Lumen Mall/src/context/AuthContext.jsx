import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Standardize the key name to 'lumenUser'
    const savedUser = localStorage.getItem('lumenUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      // Crucial: Store the password so Admin POST calls can use Basic Auth
      const userWithCreds = { ...data, password: password }; 
      
      setUser(userWithCreds);
      localStorage.setItem('lumenUser', JSON.stringify(userWithCreds));
      return true; // Return success
    }
    return false; // Return failure
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