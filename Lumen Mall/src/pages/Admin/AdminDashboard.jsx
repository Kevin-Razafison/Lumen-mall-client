import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import LogoImg from '../../assets/Lumen-Mall-logo.png'
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', category: '' });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Drones'
  });

  useEffect(() => {
    if (activeTab === 'inventory') fetchInventory();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
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

  const fetchOrders = async () => {
    if (!user?.email || !user?.password) return; // Safety check for auth
    const authHeader = btoa(`${user.email}:${user.password}`);
    try {
      const response = await fetch('http://localhost:8080/api/orders/all', {
        headers: { 'Authorization': `Basic ${authHeader}` }
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]); 
    }
  };

  const fetchUsers = async () => {
    if (!user?.email || !user?.password) return;
    const authHeader = btoa(`${user.email}:${user.password}`);
    try {
      const response = await fetch('http://localhost:8080/api/users/all', {
        headers: { 'Authorization': `Basic ${authHeader}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };
  const handleStatusChange = async (orderId, newStatus) => {
    const authHeader = btoa(`${user.email}:${user.password}`);
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`
        },
        body: JSON.stringify(newStatus)
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Status update failed:", err);
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
              <div className={styles.logoSection}>
                <img src={LogoImg} alt="Lumen Logo" className={styles.adminLogo} />
                <h2>Lumen Admin</h2>
              </div>

              <nav className={styles.navMenu}>
                <ul>
                  <li onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? styles.active : ''}>Dashboard</li>
                  <li onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? styles.active : ''}>Inventory</li>
                  <li onClick={() => setActiveTab('addProduct')} className={activeTab === 'addProduct' ? styles.active : ''}>Add Product</li>
                  <li onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? styles.active : ''}>Orders</li>
                  <li onClick={() => setActiveTab('users')} className={activeTab === 'users' ? styles.active : ''}>Users</li>
                </ul>
              </nav>

              <div className={styles.sidebarFooter}>
                <button className={styles.logoutBtn} onClick={() => window.location.href = '/'}>Exit Dashboard</button>
              </div>
            </aside>
      
      <main className={styles.content}>
        {activeTab === 'dashboard' && (
          <>
            <h1>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Orders</h3>
                <p>{orders.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Products</h3>
                <p>{inventory.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Revenue</h3>
                <p>${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}</p>
              </div>
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

        {activeTab === 'orders' && (
          <section className={styles.inventorySection}>
            <h1>Customer Orders</h1>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.userEmail}</td>
                      <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
                      <td>
                        <span className={styles.statusBadge}>{order.status || 'PENDING'}</span>
                      </td>
                      <td>
                        {order.orderDate 
                          ? new Date(order.orderDate).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        <select 
                          value={order.status} 
                          className={styles.statusSelect}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'users' && (
          <section className={styles.inventorySection}>
            <h1>User Management</h1>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={u.role === 'ADMIN' ? styles.adminBadge : styles.userBadge}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button className={styles.editBtn}>Change Role</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;