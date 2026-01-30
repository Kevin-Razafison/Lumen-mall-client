import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // Added this
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx' 
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> 
      <AuthProvider>
          <CartProvider>
            <LocationProvider>
              <App />
            </LocationProvider>
          </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
)