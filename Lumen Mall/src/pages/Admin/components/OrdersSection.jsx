import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './OrdersSection.module.css';
import { API_BASE_URL } from '../../../config';

const OrdersSection = () => {
  const { orders = [], setOrders, secureHeaders } = useOutletContext();

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
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

  return (
    <section className={styles.inventorySection}>
      <h1>Customer Orders</h1>
<div className={styles.tableWrapper}>    
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
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
</div>
    </section>
  );
};

export default OrdersSection;
