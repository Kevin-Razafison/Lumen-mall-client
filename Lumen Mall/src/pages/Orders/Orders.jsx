import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import styles from './Orders.module.css';

const Orders = () => {
  const { user } = useAuth(); 
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusStep = (status) => {
    const backendStatus = status?.toUpperCase().trim();
    if (backendStatus === 'CANCELLED') return -1;
    const steps = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED']; 
    const index = steps.indexOf(backendStatus);
    return index !== -1 ? index : 1; 
  };

  const fetchOrders = () => {
    const actualToken = user?.token;
    if (user?.email && actualToken) {
      fetch(`http://localhost:8080/api/orders/user/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${actualToken}`, 
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        setOrders(data.sort((a, b) => b.id - a.id));
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Filtering Logic: Check ID or Product Name
  const filteredOrders = orders.filter(order => {
    const matchesId = order.id.toString().includes(searchQuery);
    const matchesProduct = order.items?.some(item => 
      (item.productName || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesId || matchesProduct;
  });

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      fetch(`http://localhost:8080/api/orders/${orderId}/status?status=CANCELLED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.ok) fetchOrders(); 
        else alert("Could not cancel order.");
      })
      .catch(err => console.error("Cancel error:", err));
    }
  };

  const handleReorder = (orderItems) => {
    orderItems.forEach(item => {
      addToCart({
        id: item.productId,
        name: item.productName || item.name,
        price: item.price,
        image: item.imageUrl,
        quantity: item.quantity
      });
    });
    alert("Items added back to cart!");
    navigate('/cart');
  };

  if (loading) return <div className={styles.loader}>Loading your orders...</div>;

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Your Order History</h1>
        
        {/* Search Bar Implementation */}
        <div className={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Search by Order ID or Product..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>{searchQuery ? "No orders match your search." : "You haven't placed any orders yet."}</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map(order => {
            const status = order.status?.toUpperCase().trim();
            const isCompleted = status === 'COMPLETED';
            const isCancelled = status === 'CANCELLED';
            const isFinished = isCompleted || isCancelled;
            const canCancel = ['PENDING', 'AWAITING_PAYMENT', 'PENDING_PAYMENT'].includes(status);
            
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Timeline UI */}
                <div className={styles.trackingTimeline}>
                  {['Placed', 'Paid', 'Shipped', 'Delivered'].map((step, index) => {
                    const isActive = !isCancelled && index <= getStatusStep(order.status);
                    const isStepGreen = isActive && isCompleted;
                    return (
                      <div 
                        key={step} 
                        className={`${styles.step} ${isActive ? styles.active : ''} ${isStepGreen ? styles.completedStep : ''} ${isCancelled ? styles.cancelledStep : ''}`}
                      >
                        <div className={styles.dot}></div>
                        <span className={styles.stepLabel}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.orderBody}>
                  {order.items?.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} className={styles.miniItemImg} alt="product" />
                        )}
                        <div className={styles.itemDetails}>
                          <span className={styles.productName}>
                            {item.productName || item.name || `Item ID: ${item.productId}`}
                          </span>
                          <div className={styles.itemMeta}>
                            <span className={styles.productId}>Ref: {item.productId}</span>
                            <span className={styles.qty}>Quantity: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.footerLeft}>
                    <span className={`${styles.statusBadge} ${isCompleted ? styles.statusDelivered : isCancelled ? styles.statusCancelled : styles.statusPaid}`}>
                      {isCompleted ? 'Delivered' : (order.status || 'Paid')}
                    </span>

                    {canCancel && (
                      <button onClick={() => handleCancelOrder(order.id)} className={styles.cancelBtn}>
                        Cancel
                      </button>
                    )}

                    {isFinished && (
                      <button onClick={() => handleReorder(order.items)} className={styles.reorderBtn}>
                        Reorder
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.totalBox}>
                    <span>Total Paid:</span>
                    <strong>${order.totalAmount.toFixed(2)}</strong>
                  </div>
                </div> 
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;