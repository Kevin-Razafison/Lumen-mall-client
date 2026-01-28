import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import LogoImg from '../../assets/Lumen-Mall-logo.png';

const PRODUCT_CATEGORIES = ['Electronics', 'Smart Home', 'Wearables', 'Audio', 'Drones','New Arrival'];
const STOCK_FILTERS = ['All Items', 'Low Stock', 'Out of Stock', 'On Sale'];

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
    features: [] 
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = inventory.filter(p => p.stock === 0).length;

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

  const handleReply = async (id, replyText) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${id}/reply`, {
        method: 'PUT',
        headers: secureHeaders,
        body: replyText // Sending as plain string or wrap in object if preferred
      });
      if (response.ok) {
        fetchAllReviews(); // Refresh to show the new reply
        setReplyToId(null); // Close the input
      }
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };
  useEffect(() => {
    if (activeTab === 'inventory') fetchInventory();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'reviews') fetchAllReviews(); 
  }, [activeTab]);

  const exportOrdersToCSV = () => {
    const headers = ["Order ID,Customer Email,Total Amount,Status,Payment Method,Date"];
    
    const rows = orders.map(order => [
      order.id,
      order.customerEmail,
      order.totalAmount,
      order.status,
      order.paymentMethod,
      new Date(order.createdAt).toLocaleDateString()
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LumenMall_Sales_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Logic for Stock/Sale Filters
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock === 0;
    const isOnSale = product.salePrice && product.salePrice < product.price;

    // Logic for Category Selection
    let matchesFilter = false;
    if (filterCategory === 'All') {
      matchesFilter = true;
    } else if (filterCategory === 'Low Stock') {
      matchesFilter = isLowStock;
    } else if (filterCategory === 'Out of Stock') {
      matchesFilter = isOutOfStock;
    } else if (filterCategory === 'On Sale') {
      matchesFilter = isOnSale;
    } else {
      matchesFilter = product.category === filterCategory;
    }

    return matchesSearch && matchesFilter;
  });
  const getMonthlySalesData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesMap = {};

        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          salesMap[months[d.getMonth()]] = 0;
        }

        orders.forEach(order => {
          if (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPED') {
            const date = new Date(order.createdAt || Date.now());
            const monthName = months[date.getMonth()];
            if (salesMap.hasOwnProperty(monthName)) {
              salesMap[monthName] += (order.totalAmount || 0);
            }
          }
        });

      return Object.entries(salesMap).map(([name, total]) => ({ name, total }));
    };

    const monthlySales = getMonthlySalesData();
    const maxSales = Math.max(...monthlySales.map(s => s.total), 100); // For scaling bars

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
  const fetchAllReviews = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:8080/api/reviews/all', { 
        headers: secureHeaders 
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${id}`, {
        method: 'DELETE',
        headers: secureHeaders
      });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
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
          salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) : null, // Handle null correctly
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

  const getTopProducts = () => {
      const productCounts = {};

      orders.forEach(order => {
        if (['PAID', 'SHIPPED', 'COMPLETED'].includes(order.status)) {
          order.items?.forEach(item => {
            // 1. Look up the product in inventory using the ID from the order item
            const product = inventory.find(p => p.id.toString() === item.productId?.toString());
            
            // 2. Use the name from inventory, or fallback if not found
            const name = product ? product.name : `Product #${item.productId}`;
            
            productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
          });
        }
      });

      return Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); 
    };

  const topProducts = getTopProducts();
  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);
  
  const totalProducts = inventory.length;
  const totalReviews = reviews.length;
  const totalHelpfulVotes = reviews.reduce((acc, rev) => acc + (rev.helpfulCount || 0), 0);
  const pendingReplies = reviews.filter(rev => !rev.adminReply).length;

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
            <li onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? styles.active : ''}>Reviews</li>
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
                {/* 1. Total Products */}
                <div className={styles.statCard} onClick={() => {setActiveTab('inventory'); setFilterCategory('All');}}>
                  <h3>Total Products</h3>
                  <p className={styles.statNumber}>{inventory.length}</p>
                </div>

                {/* 2. Total Revenue */}
                <div className={styles.statCard}>
                  <h3>Total Revenue</h3>
                  <p className={styles.statNumber}>
                    ${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                  </p>
                </div>

                {/* 3. Community Engagement (Helpful Votes) */}
                <div className={styles.statCard} style={{ borderLeftColor: '#f0c14b' }}>
                  <h3>Helpful Votes</h3>
                  <p className={styles.statNumber}>
                    {reviews.reduce((acc, rev) => acc + (rev.helpfulCount || 0), 0)} 👍
                  </p>
                </div>

                {/* 4. Action Needed: Unanswered Reviews */}
                <div 
                  className={`${styles.statCard} ${reviews.filter(r => !r.adminReply).length > 0 ? styles.warningCard : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <h3>Pending Replies</h3>
                  <p className={styles.statNumber}>{reviews.filter(rev => !rev.adminReply).length}</p>
                  {reviews.filter(r => !r.adminReply).length > 0 && <span className={styles.actionPrompt}>Reply Now →</span>}
                </div>

                {/* 5. Inventory Alert: Low Stock */}
                <div 
                  className={`${styles.statCard} ${lowStockCount > 0 ? styles.warningCard : ''}`}
                  onClick={() => {setActiveTab('inventory'); setFilterCategory('Low Stock');}}
                >
                  <h3>Low Stock</h3>
                  <p className={styles.statNumber}>{lowStockCount}</p>
                  {lowStockCount > 0 && <span className={styles.actionPrompt}>Restock →</span>}
                </div>
              </div>
              {/* The Report Section */}
              <div className={styles.reportSection}>
                  <div className={styles.reportHeader}>
                    <h2>Monthly Revenue (Last 6 Months)</h2>
                    <button onClick={exportOrdersToCSV} className={styles.exportBtn}>
                      📥 Export CSV
                    </button>
                  </div>
                <div className={styles.chartContainer}>
                  {monthlySales.map(data => (
                    <div key={data.name} className={styles.chartBarWrapper}>
                      <div className={styles.barLabel}>${data.total.toFixed(0)}</div>
                      <div 
                        className={styles.chartBar} 
                        style={{ height: `${(data.total / maxSales) * 150}px` }}
                      ></div>
                      <div className={styles.monthName}>{data.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.dashboardGrid}>
              {/* The recent Order Section */}
              <div className={styles.recentOrdersSection}>
                <div className={styles.sectionHeader}>
                  <h2>Recent Activity</h2>
                  <button onClick={() => setActiveTab('orders')} className={styles.viewAllBtn}>View All Orders</button>
                </div>
                <table className={styles.miniTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerEmail}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>${order.totalAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* The Sales Chart Section */}
              <div className={styles.reportSection}>
                <div className={styles.reportHeader}>
                  <h2>Monthly Revenue</h2>
                  <button onClick={exportOrdersToCSV} className={styles.exportBtn}>📥 Export</button>
                </div>
                {/* ... your existing chartContainer code ... */}
              </div>
              {/* NEW: Top Selling Products Section */}
              <div className={styles.topProductsSection}>
                <h2>Top Selling Products</h2>
                <div className={styles.productList}>
                  {topProducts.length > 0 ? (
                    topProducts.map((item, index) => (
                      <div key={index} className={styles.productRankItem}>
                        <span className={styles.rankNumber}>#{index + 1}</span>
                        <div className={styles.rankInfo}>
                          <span className={styles.rankName}>{item.name}</span>
                          <span className={styles.rankCount}>{item.count} units sold</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyState}>No sales recorded yet.</p>
                  )}
                </div>
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
                  <optgroup label="Product Categories">
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Inventory Status">
                    <option value="Low Stock">Low Stock (≤ 5)</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="On Sale">Items on Sale</option>
                  </optgroup>
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
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map(product => (
                  // 1. ADDED: Highlight the whole row if stock is 0
                <tr key={product.id} className={product.stock === 0 ? styles.outOfStockRow : ''}> 
                  <td><img src={product.imageUrl || '/drone-product-image.png'} alt="thumb" className={styles.tableThumb} /></td>
                  
                  {/* Name Column */}
                  <td>
                    {editingId === product.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                    ) : product.name}
                  </td>

                  {/* Stock Column */}
                  <td>
                    {editingId === product.id ? (
                      <input type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})} />
                    ) : (
                      <span className={product.stock <= 5 ? `${styles.lowStockText} ${product.stock === 0 ? styles.criticalStock : ''}` : ''}>
                        {product.stock === 0 ? "OUT OF STOCK" : product.stock}
                      </span>
                    )}
                  </td>

                  {/* Price Column - Handling Regular and Sale Price */}
                  <td>
                    {editingId === product.id ? (
                      <div className={styles.editPriceGroup}>
                        <input 
                          type="number" 
                          placeholder="Regular"
                          value={editForm.price} 
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                        />
                        <input 
                          type="number" 
                          placeholder="Sale (Optional)"
                          value={editForm.salePrice || ''} 
                          onChange={(e) => setEditForm({...editForm, salePrice: e.target.value})} 
                        />
                      </div>
                    ) : (
                      <div className={styles.priceDisplay}>
                        {product.salePrice ? (
                          <>
                            <span className={styles.originalPriceMuted}>${Number(product.price).toFixed(2)}</span>
                            <span className={styles.salePriceActive}>${Number(product.salePrice).toFixed(2)}</span>
                          </>
                        ) : (
                          `$${Number(product.price).toFixed(2)}`
                        )}
                      </div>
                    )}
                  </td>

                  {/* Category Column */}
                  <td>
                    {editingId === product.id ? (
                      <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                        {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    ) : (
                      <span className={styles.categoryBadge}>{product.category}</span>
                    )}
                  </td>

                  {/* Date Column */}
                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</td>

                  {/* Actions Column */}
                  <td>
                    <div className={styles.actionGroup}>
                      {editingId === product.id ? (
                        <>
                          <button onClick={() => handleUpdateProduct(product.id)} className={styles.saveBtn}>Save</button>
                          <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleQuickRestock(product)} className={styles.restockBtn}>+ Stock</button>
                          <button onClick={() => {
                            setEditingId(product.id);
                            setEditForm({ 
                              ...product,
                              salePrice: product.salePrice || '' // Ensure salePrice is in the edit form
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
        {activeTab === 'reviews' && (
          <section className={styles.inventorySection}>
            <h1>Review & Moderation</h1>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment & Reply</th> {/* Updated Header */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map(rev => (
                    <tr key={rev.id}>
                      <td>#{rev.id}</td>
                      <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {rev.productName || `Product ID: ${rev.productId}`}
                      </td>
                      <td>{rev.userEmail}</td>
                      <td>
                        <span style={{ color: '#f0c14b' }}>
                          {"★".repeat(rev.rating)}
                          <span style={{ color: '#e0e0e0' }}>{"★".repeat(5 - rev.rating)}</span>
                        </span>
                      </td>
                      
                      {/* --- ENHANCED COMMENT & REPLY SECTION --- */}
                      <td style={{ maxWidth: '400px' }}>
                        <div style={{ marginBottom: '8px' }}>{rev.comment}</div>
                        
                        {rev.adminReply ? (
                          <div style={{ 
                            fontSize: '0.85rem', 
                            backgroundColor: '#f0f7ff', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            borderLeft: '3px solid #007bff' 
                          }}>
                            <strong style={{ color: '#007bff' }}>Lumen Mall:</strong> {rev.adminReply}
                          </div>
                        ) : (
                          replyToId === rev.id ? (
                            <div style={{ marginTop: '10px' }}>
                              <textarea 
                                style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                value={replyText} 
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your response..."
                              />
                              <div style={{ marginTop: '5px' }}>
                                <button 
                                  onClick={() => handleReply(rev.id, replyText)}
                                  style={{ padding: '2px 8px', marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                  Send
                                </button>
                                <button 
                                  onClick={() => setReplyToId(null)}
                                  style={{ padding: '2px 8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setReplyToId(rev.id); setReplyText(''); }}
                              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                            >
                              Reply to Customer
                            </button>
                          )
                        )}
                      </td>

                      <td>
                        <button 
                          onClick={() => handleDeleteReview(rev.id)} 
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No reviews found.
                    </td>
                  </tr>
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