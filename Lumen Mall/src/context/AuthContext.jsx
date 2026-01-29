import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('lumenUser');
      // Safety check: only parse if it exists and isn't "undefined"
      return (savedUser && savedUser !== "undefined") ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for cold start
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          signal: controller.signal // Connect the timeout signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, message: errorData.message || "Invalid credentials" };
        }

        const data = await response.json();

        if (data.token && data.fullName) { 
          const userData = { 
            id: data.id, 
            email: data.email, 
            fullName: data.fullName, 
            role: data.role 
          };
          
          localStorage.setItem('lumenToken', data.token);
          localStorage.setItem('lumenUser', JSON.stringify(userData));
          setUser(userData);

          return { success: true };
        }
        
        return { success: false, message: "Server response missing user data" };
      } catch (error) {
        if (error.name === 'AbortError') {
          return { success: false, message: "Server took too long to respond. Please try again." };
        }
        console.error("Login Context Error:", error);
        throw error; 
      }
    }; 

    const logout = () => {
      setUser(null);
      localStorage.removeItem('lumenToken');
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