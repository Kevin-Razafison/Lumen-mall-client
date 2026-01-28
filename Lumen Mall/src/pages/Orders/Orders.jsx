import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import styles from './Orders.module.css';

const Orders = () => {
  const { user } = useAuth(); 
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // PDF Generation Logic (Fixed autoTable function call)
  const downloadInvoice = (order) => {
    const doc = new jsPDF();

    // Branding
    doc.setFontSize(22);
    doc.setTextColor(254, 189, 105); // #febd69
    doc.text("LUMEN MALL", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice: LMN-${order.id}`, 14, 30);
    doc.text(`Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}`, 14, 35);

    // Shipping Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Shipping Address:", 14, 50);
    doc.setFontSize(10);
    doc.text(`${order.customerName || 'Customer'}`, 14, 57);
    doc.text(`${order.shippingAddress || 'No address provided'}`, 14, 62);

    // Table
    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = order.items.map(item => [
      item.productName || item.name || `ID: ${item.productId}`,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    // Use autoTable function directly
    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [43, 48, 58] },
      theme: 'striped'
    });

    // Get position after table
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Paid: $${order.totalAmount.toFixed(2)}`, 140, finalY);

    doc.save(`Lumen_Invoice_${order.id}.pdf`);
  };

  // Filtering Logic
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
        <div className={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Search by ID or Product..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>✕</button>}
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
                        {item.imageUrl && <img src={item.imageUrl} className={styles.miniItemImg} alt="product" />}
                        <div className={styles.itemDetails}>
                          <span className={styles.productName}>{item.productName || item.name || `Item ID: ${item.productId}`}</span>
                          <div className={styles.itemMeta}>
                            <span className={styles.productId}>Ref: {item.productId}</span>
                            <span className={styles.qty}>Qty: {item.quantity}</span>
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

                    {canCancel && <button onClick={() => handleCancelOrder(order.id)} className={styles.cancelBtn}>Cancel</button>}
                    {isFinished && <button onClick={() => handleReorder(order.items)} className={styles.reorderBtn}>Reorder</button>}
                    
                    <button onClick={() => downloadInvoice(order)} className={styles.invoiceBtn}>
                      Invoice
                    </button>
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