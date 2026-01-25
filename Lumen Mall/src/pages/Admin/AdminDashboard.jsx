import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]); // State for the product list
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Drones'
  });

  // Fetch inventory whenever the tab changes to 'inventory'
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user || !user.password) {
      alert("Security Error: Please log back in.");
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
        setNewProduct({ name: '', description: '', price: '', imageUrl: '', category: 'Drones' });
        fetchInventory(); // Refresh list
        setActiveTab('inventory'); // Switch to see the new item
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const authHeader = btoa(`${user.email}:${user.password}`);

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${authHeader}` }
      });

      if (response.ok) {
        setInventory(inventory.filter(p => p.id !== productId));
      } else {
        alert("Failed to delete. Check admin permissions.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <h2>Lumen Admin</h2>
        <ul>
          <li onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? styles.active : ''}>Dashboard</li>
          <li onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? styles.active : ''}>Inventory</li>
          <li onClick={() => setActiveTab('addProduct')} className={activeTab === 'addProduct' ? styles.active : ''}>Add Product</li>
          <li>Orders</li>
        </ul>
      </aside>
      
      <main className={styles.content}>
        {activeTab === 'dashboard' && (
          <>
            <h1>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>Total Sales: $12,400</div>
              <div className={styles.statCard}>Total Products: {inventory.length}</div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <section className={styles.inventorySection}>
            <h1>Product Inventory</h1>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.imageUrl || '/drone-product-image.png'} 
                        alt="thumb" 
                        className={styles.tableThumb} 
                        onError={(e) => e.target.src = '/drone-product-image.png'}
                      />
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.category}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'addProduct' && (
          <section className={styles.formSection}>
            <h1>Add New Product</h1>
            <form onSubmit={handleAddProduct} className={styles.productForm}>
              <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleChange} required />
              <div className={styles.fileUploadGroup}>
                <label>Product Image:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
              </div>
              {newProduct.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={newProduct.imageUrl} alt="Preview" style={{ width: '80px', borderRadius: '4px' }} />
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