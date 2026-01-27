import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import LogoImg from '../../assets/Lumen-Mall-logo.png';

const PRODUCT_CATEGORIES = ['Electronics', 'Smart Home', 'Wearables', 'Audio', 'Drones'];

const AdminDashboard = () => {
  const [featureInput, setFeatureInput] = useState('');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: '',
    stock: 0,
    features: [] // <--- Add this
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    imageUrl: '',
    category: 'Electronics',
    features: [] 
  });

  const secureHeaders = {
    'Authorization': `Bearer ${user?.token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    if (activeTab === 'inventory') fetchInventory();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Derived State: Filters the inventory in real-time
  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        setInventory([]);
        return;
      }
      const data = await response.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventory([]);
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
      setOrders([]); 
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

  const handleStatusChange = async (orderId, newStatus) => {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: secureHeaders,
          body: JSON.stringify(newStatus)
        });
        if (response.ok) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
      } catch (err) {
        console.error("Status update failed:", err);
      }
    };
    const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
        method: 'PUT',
        headers: secureHeaders, // Your JWT headers
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        console.log(`User ${userId} promoted/demoted to ${newRole}`);
      }
    } catch (err) {
      console.error("Role update failed:", err);
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
  const addFeature = (type) => {
    if (!featureInput.trim()) return;
    if (type === 'new') {
      setNewProduct({ ...newProduct, features: [...newProduct.features, featureInput.trim()] });
    } else {
      setEditForm({ ...editForm, features: [...editForm.features, featureInput.trim()] });
    }
    setFeatureInput('');
  };
  const handleQuickRestock = async (product) => {
    const amountToAdd = window.prompt(`Restock "${product.name}"\nHow many units are you adding?`, "10");
    
    if (amountToAdd === null) return; // User cancelled
    
    const parsedAmount = parseInt(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const updatedStock = (product.stock || 0) + parsedAmount;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PUT',
        headers: secureHeaders,
        body: JSON.stringify({
          ...product,
          stock: updatedStock
        }),
      });

      if (response.ok) {
        setInventory(inventory.map(p => p.id === product.id ? { ...p, stock: updatedStock } : p));
      } else {
        alert("Restock failed. Please try again.");
      }
    } catch (err) {
      console.error("Restock error:", err);
    }
  };
  const removeFeature = (index, type) => {
    if (type === 'new') {
      setNewProduct({ ...newProduct, features: newProduct.features.filter((_, i) => i !== index) });
    } else {
      setEditForm({ ...editForm, features: editForm.features.filter((_, i) => i !== index) });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      alert("Security Error: Please log back in.");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: secureHeaders,
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0 // Ensure stock is a number
        }),
      });

      if (response.ok) {
        alert("Product added successfully!");
        setNewProduct({ 
          name: '', 
          description: '', 
          price: '', 
          stock: 0, 
          imageUrl: '', 
          category: 'Electronics', 
          features: [] 
        });
        fetchInventory(); 
        setActiveTab('inventory'); 
      }
      else {
        const errorText = await response.text(); // Get the raw error message
        console.log("Backend Error:", errorText);
        alert(`Server says: ${errorText}`); 
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Could not connect to the server.");
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: secureHeaders
      });
      if (response.ok) {
        setInventory(inventory.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpdateProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'PUT',
        headers: secureHeaders,
        body: JSON.stringify({
          ...editForm,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock)
        }),
      });

      if (response.ok) {
        setInventory(inventory.map(p => p.id === productId ? { ...p, ...editForm } : p));
        setEditingId(null); 
      } else {
        alert("Update failed. Check your data.");
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
                <p>${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <section className={styles.inventorySection}>
            <div className={styles.inventoryHeader}>
              <h1>Product Inventory</h1>
              
              {/* NEW: Search and Filter Bar */}
              <div className={styles.filterControls}>
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className={styles.categoryFilter}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map(product => (
                  // 1. ADDED: Highlight the whole row if stock is 0
                  <tr key={product.id} className={product.stock === 0 ? styles.outOfStockRow : ''}> 
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
                            value={editForm.stock} 
                            onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})} 
                          />
                        ) : (
                          <span className={product.stock <= 5 ? `${styles.lowStockText} ${product.stock === 0 ? styles.criticalStock : ''}` : ''}>
                            {product.stock === 0 ? "OUT OF STOCK" : product.stock}
                          </span>
                        )}
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
                    <td>
                      {editingId === product.id ? (
                        <select 
                          value={editForm.category} 
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})} 
                          className={styles.tableSelect}
                        >
                          {PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={styles.categoryBadge}>{product.category}</span>
                      )}
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
                          <button 
                            onClick={() => handleQuickRestock(product)} 
                            className={styles.restockBtn}
                            title="Quick Restock"
                          >
                            + Add Stock
                          </button>
                            <button onClick={() => {
                              setEditingId(product.id);
                              setEditForm({ 
                                name: product.name, 
                                price: product.price, 
                                description: product.description, 
                                category: product.category,
                                stock: product.stock, // 2. ADDED: Keeps the current stock value when you click Edit
                                features: product.features || []
                              });
                            }} className={styles.editBtn}>Edit</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteBtn}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </section>
        )}

        {activeTab === 'addProduct' && (
          <section className={styles.formSection}>
            <h1>Add New Product</h1>
            <form onSubmit={handleAddProduct} className={styles.productForm}>
              <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleChange} required />
              <div className={styles.featureSection}>
              <label className={styles.fieldLabel}>Product Features:</label>
              <div className={styles.featureInputGroup}>
                <input 
                  type="text" 
                  placeholder="e.g. 4K Camera" 
                  value={featureInput} 
                  onChange={(e) => setFeatureInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature('new'))}
                />
                <button type="button" onClick={() => addFeature('new')} className={styles.addFeatureBtn}>Add</button>
              </div>
              <div className={styles.featureChips}>
                {newProduct.features.map((feat, index) => (
                  <span key={index} className={styles.chip}>
                    {feat} 
                    <button type="button" onClick={() => removeFeature(index, 'new')}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Initial Stock:</label>
                <input 
                  type="number" 
                  name="stock" 
                  placeholder="0" 
                  value={newProduct.stock} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleChange} required />
              
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Category:</label>
                <select 
                  name="category" 
                  value={newProduct.category} 
                  onChange={handleChange} 
                  className={styles.categorySelect}
                  required
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

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
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerEmail}</td>
                      <td>${Number(order.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td>{order.paymentMethod || 'Not Specified'}</td>
                      <td>
                        <select 
                          value={order.status} 
                          className={styles.statusSelect}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                          <option value="PAID">Paid</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders found.</td></tr>
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
                        <span className={u.role === 'ROLE_ADMIN' ? styles.adminBadge : styles.userBadge}>
                          {u.role}
                        </span>
                      </td>
                        <td>
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={styles.statusSelect}
                            disabled={u.id === user.id} 
                          >
                            <option value="ROLE_USER">USER</option>
                            <option value="ROLE_ADMIN">ADMIN</option>
                          </select>
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