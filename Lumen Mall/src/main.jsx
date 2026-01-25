import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx' // Add this
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
        <CartProvider>
          <LocationProvider>
            <App />
          </LocationProvider>
        </CartProvider>
    </AuthProvider>
  </React.StrictMode>
 
)