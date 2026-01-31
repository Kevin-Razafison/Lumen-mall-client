import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import styles from './Orders.module.css';
import { API_BASE_URL } from '../../config';

const Orders = () => {
  const { user } = useAuth(); 
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Review System State
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const getStatusStep = (status) => {
    const backendStatus = status?.toUpperCase().trim();
    if (backendStatus === 'CANCELLED') return -1;
    const steps = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED']; 
    const index = steps.indexOf(backendStatus);
    return index !== -1 ? index : 1; 
  };

  const fetchOrders = async () => {

    
    const actualToken = localStorage.getItem('lumenToken'); // Get from localStorage instead
    
    if (!user?.email) {
      console.error('❌ No user email found');
      setError('User email not found. Please log in again.');
      setLoading(false);
      return;
    }

    if (!actualToken) {
      console.error('❌ No auth token found');
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
      return;
    }

    const url = `${API_BASE_URL}/api/orders/user/${user.email}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${actualToken}`, 
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();

      setOrders(data.sort((a, b) => b.id - a.id));
      setLoading(false);
      setError(null);

    } catch (err) {
      setError(err.message || 'Failed to load orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // PDF Generation Logic
  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(254, 189, 105); 
    doc.text("LUMEN MALL", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice: LMN-${order.id}`, 14, 30);
    doc.text(`Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}`, 14, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Shipping Address:", 14, 50);
    doc.setFontSize(10);
    doc.text(`${order.customerName || 'Customer'}`, 14, 57);
    doc.text(`${order.shippingAddress || 'No address provided'}`, 14, 62);

    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = order.items.map(item => [
      item.productName || item.name || `ID: ${item.productId}`,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [43, 48, 58] },
      theme: 'striped'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Paid: $${order.totalAmount.toFixed(2)}`, 140, finalY);
    doc.save(`Lumen_Invoice_${order.id}.pdf`);
  };

  const downloadSummary = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(254, 189, 105);
    doc.text("PURCHASE SUMMARY REPORT", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`User: ${user.email}`, 14, 33);

    const tableColumn = ["Order ID", "Date", "Status", "Items", "Total"];
    const tableRows = filteredOrders.map(order => [
      `#${order.id}`,
      new Date(order.orderDate || order.createdAt).toLocaleDateString(),
      order.status,
      order.items.length,
      `$${order.totalAmount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [254, 189, 105], textColor: [0, 0, 0] },
    });

    const grandTotal = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 140, finalY);
    doc.save(`Order_Summary_${new Date().getTime()}.pdf`);
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
      const token = localStorage.getItem('lumenToken');
      fetch(`${API_BASE_URL}/api/orders/${orderId}/status?status=CANCELLED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleSubmitReview = () => {
    if (!selectedProductId) {
      alert("Please select a product to review.");
      return;
    }

    const token = localStorage.getItem('lumenToken');
    const reviewData = {
      orderId: reviewingOrder.id,
      productId: selectedProductId.toString(),
      userEmail: user.email,
      rating: rating,
      comment: comment
    };

    fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })
    .then(res => {
      if (res.ok) {
        alert("Review submitted! Thank you for your feedback.");
        setReviewingOrder(null);
        setComment("");
        setRating(5);
        setSelectedProductId("");
      } else {
        alert("Failed to submit review.");
      }
    })
    .catch(err => console.error("Review submit error:", err));
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        Loading your orders...
        <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          Check browser console (F12) for debug info
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.noOrders} style={{ color: '#d00' }}>
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchOrders();
            }}
            style={{ marginTop: '20px', padding: '10px 20px' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
            <h1 className={styles.title}>Your Order History</h1>
            <button onClick={downloadSummary} className={styles.summaryBtn}>
                Download Report ({filteredOrders.length})
            </button>
        </div>
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
            const canCancel = ['PENDING', 'AWAITING_PAYMENT'].includes(status);
            
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
                    return (
                      <div key={step} className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted && isActive ? styles.completedStep : ''} ${isCancelled ? styles.cancelledStep : ''}`}>
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
                    {isCompleted && <button onClick={() => {
                        setReviewingOrder(order);
                        if(order.items.length > 0) setSelectedProductId(order.items[0].productId);
                    }} className={styles.reviewBtn}>Review</button>}
                    
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

      {/* Review Modal */}
      {reviewingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.reviewModal}>
            <h2>Rate Your Order #{reviewingOrder.id}</h2>
            
            {/* Product Selection for Review */}
            <div className={styles.productSelectGroup}>
                <label>Select Item to Review:</label>
                <select 
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={styles.commentArea}
                    style={{height: 'auto', marginBottom: '15px'}}
                >
                    {reviewingOrder.items.map(item => (
                        <option key={item.productId} value={item.productId}>
                            {item.productName || item.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rating ? styles.starFilled : styles.starEmpty} onClick={() => setRating(star)}>★</span>
              ))}
            </div>
            <textarea 
              placeholder="Leave a comment about your products..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              className={styles.commentArea} 
            />
            <div className={styles.modalActions}>
              <button onClick={() => setReviewingOrder(null)} className={styles.modalCancel}>Close</button>
              <button onClick={handleSubmitReview} className={styles.submitBtn}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;