import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import { LuMenu, LuX } from 'react-icons/lu'; 
import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const { user } = useAuth();
  const loc = useLocation(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  /**
   * FIX 1: Generate headers dynamically from localStorage.
   * This ensures we don't send "Bearer undefined".
   */
  const getSecureHeaders = () => {
    const token = localStorage.getItem('lumenToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [loc.pathname]);

  /**
   * FIX 2: Centralized Fetch Logic
   * We now check loc.pathname to decide what to load.
   */
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
      // Public route, no token needed
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventory([]);
    }
  };

  const fetchAllReviews = async () => {
    const token = localStorage.getItem('lumenToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/all`, { 
        headers: getSecureHeaders() 
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('lumenToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/all`, { 
        headers: getSecureHeaders() 
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('lumenToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/all`, { 
        headers: getSecureHeaders() 
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <button 
        className={styles.mobileToggle} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <LuX /> : <LuMenu />}
      </button>

      <Sidebar isOpen={isSidebarOpen} /> 

      <main className={styles.content}>
        <Outlet context={{ 
          inventory, setInventory, 
          orders, setOrders, 
          users, setUsers, 
          reviews, setReviews,
          // FIX 3: Pass the dynamic header function or the current headers
          secureHeaders: getSecureHeaders(),
          fetchInventory, 
          fetchOrders, // Added this so children can refresh the list
          fetchAllReviews,
          fetchUsers,
          currentUserId: user?.id
        }} />
      </main>

      {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminDashboard;