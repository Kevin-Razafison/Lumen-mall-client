import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation(); // To detect URL changes for fetching data
  
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const secureHeaders = {
    'Authorization': `Bearer ${user?.token}`,
    'Content-Type': 'application/json'
  };

  // Logic to fetch data based on the current URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('inventory')) fetchInventory();
    else if (path.includes('orders')) fetchOrders();
    else if (path.includes('users')) fetchUsers();
    else if (path.includes('reviews')) fetchAllReviews();
    else fetchInventory(); // Fetch default data for dashboard
  }, [location.pathname]);

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
      <Sidebar /> 

      <main className={styles.content}>
        {/* Everything inside the context object is passed to children */}
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
    </div>
  );
};

export default AdminDashboard;