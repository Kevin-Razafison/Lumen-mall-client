import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', category: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Drones'
  });

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
        fetchInventory(); 
        setActiveTab('inventory'); 
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
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpdateProduct = async (productId) => {
    const authHeader = btoa(`${user.email}:${user.password}`);
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setInventory(inventory.map(p => p.id === productId ? { ...p, ...editForm } : p));
        setEditingId(null); 
      }
    } catch (err) {
      console.error("Update failed:", err);
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
                    <td><img src={product.imageUrl || '/drone-product-image.png'} alt="thumb" className={styles.tableThumb} /></td>
                    <td>
                      {editingId === product.id ? (
                        <input 
                          value={editForm.name} 
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                        />
                      ) : product.name}
                    </td>
                    <td>
                      {editingId === product.id ? (
                        <input 
                          type="number" 
                          value={editForm.price} 
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                        />
                      ) : `$${Number(product.price).toFixed(2)}`}
                    </td>
                    
                    {/* FIXED: Added missing Category column to align the row with the header */}
                    <td>
                       {editingId === product.id ? (
                        <input 
                          value={editForm.category} 
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})} 
                        />
                      ) : product.category}
                    </td>

                    <td>
                      <div className={styles.actionGroup}>
                        {editingId === product.id ? (
                          <>
                            <button onClick={() => handleUpdateProduct(product.id)} className={styles.saveBtn}>Save</button>
                            <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => {
                              setEditingId(product.id);
                              setEditForm({ 
                                name: product.name, 
                                price: product.price, 
                                description: product.description, 
                                category: product.category 
                              });
                            }} className={styles.editBtn}>Edit</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteBtn}>Delete</button>
                          </>
                        )}
                      </div>
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