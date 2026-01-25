import React, { useState } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext'; // 1. Import useAuth

const AdminDashboard = () => {
  const {user} = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '', // This will hold our Base64 string
    category: 'Drones'
  });

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle local file selection and convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This is the string representation of your image
        setNewProduct({ ...newProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

    const handleAddProduct = async (e) => {
      e.preventDefault();

      // DEBUG: Check if we actually have the credentials
      if (!user || !user.password) {
          alert("Security Error: Please log out and log back in to refresh your admin session.");
          return;
        }

        const authHeader = btoa(`${user.email}:${user.password}`);

      try {
        const response = await fetch('http://localhost:8080/api/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authHeader}`
          },
          body: JSON.stringify(newProduct),
        });

        if (response.ok) {
          alert("Product added successfully!");
          setActiveTab('dashboard');
        } else {
          // Log the status to see if it's 401 (Wrong credentials) or 403 (Wrong Role)
          console.log("Response Status:", response.status);
          alert(`Server rejected request (Status: ${response.status}).`);
        }
      } catch (err) {
        console.error("Connection error:", err);
      }
    };
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <h2>Lumen Admin</h2>
        <ul>
          <li 
            onClick={() => setActiveTab('dashboard')} 
            className={activeTab === 'dashboard' ? styles.active : ''}
          >
            Dashboard
          </li>
          <li 
            onClick={() => setActiveTab('inventory')} 
            className={activeTab === 'inventory' ? styles.active : ''}
          >
            Inventory
          </li>
          <li>Orders</li>
          <li>Users</li>
        </ul>
      </aside>
      
      <main className={styles.content}>
        {activeTab === 'dashboard' ? (
          <>
            <h1>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>Total Sales: $12,400</div>
              <div className={styles.statCard}>Active Orders: 15</div>
              <div className={styles.statCard}>Total Products: 48</div>
              <div className={styles.statCard}>New Users: 12</div>
            </div>
          </>
        ) : (
          <section className={styles.formSection}>
            <h1>Add New Product</h1>
            <form onSubmit={handleAddProduct} className={styles.productForm}>
              <input 
                type="text" 
                name="name" 
                placeholder="Product Name" 
                value={newProduct.name} 
                onChange={handleChange} 
                required 
              />
              <textarea 
                name="description" 
                placeholder="Description" 
                value={newProduct.description} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="number" 
                name="price" 
                placeholder="Price" 
                value={newProduct.price} 
                onChange={handleChange} 
                required 
              />
              
              <div className={styles.fileUploadGroup}>
                <label>Product Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required 
                />
              </div>

              {/* Preview the image so the admin knows it worked */}
              {newProduct.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={newProduct.imageUrl} alt="Preview" style={{ width: '100px', marginTop: '10px', borderRadius: '4px' }} />
                </div>
              )}

              <button type="submit" className={styles.submitBtn}>Save Product</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;