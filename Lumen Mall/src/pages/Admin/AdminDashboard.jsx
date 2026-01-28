import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import { LuMenu, LuX } from 'react-icons/lu'; // Ensure these are installed

const AdminDashboard = () => {
  const { user } = useAuth();
  const loc = useLocation(); // Use 'loc' to avoid collision with global 'location'
  
  // 1. ADDED THIS STATE (Fixes the ReferenceError)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const secureHeaders = {
    'Authorization': `Bearer ${user?.token}`,
    'Content-Type': 'application/json'
  };

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const path = loc.pathname;
    if (path.includes('inventory')) fetchInventory();
    else if (path.includes('orders')) fetchOrders();
    else if (path.includes('users')) fetchUsers();
    else if (path.includes('reviews')) fetchAllReviews();
    else fetchInventory(); 
  }, [loc.pathname]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      const data = await response.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventory([]);
    }
  };

  const fetchAllReviews = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:8080/api/reviews/all', { headers: secureHeaders });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const fetchOrders = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:8080/api/orders/all', { headers: secureHeaders });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchUsers = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:8080/api/users/all', { headers: secureHeaders });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* 2. Mobile Toggle Button */}
      <button 
        className={styles.mobileToggle} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <LuX /> : <LuMenu />}
      </button>

      {/* 3. Pass the state to Sidebar */}
      <Sidebar isOpen={isSidebarOpen} /> 

      <main className={styles.content}>
        <Outlet context={{ 
          inventory, setInventory, 
          orders, setOrders, 
          users, setUsers, 
          reviews, setReviews,
          secureHeaders,
          fetchInventory, 
          fetchAllReviews,
          currentUserId: user?.id
        }} />
      </main>

      {/* 4. Overlay for mobile */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminDashboard;