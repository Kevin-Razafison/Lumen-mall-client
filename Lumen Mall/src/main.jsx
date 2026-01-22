import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx' // Add this

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <LocationProvider> {/* Wrap App here */}
        <App />
      </LocationProvider>
    </CartProvider>
  </React.StrictMode>
)