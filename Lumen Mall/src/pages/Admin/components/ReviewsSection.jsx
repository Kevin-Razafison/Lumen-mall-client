import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './ReviewsSection.module.css'; // Kept exactly as requested

const ReviewsSection = () => {
  // Logic must be inside the component function to access context and state
  const { reviews = [], setReviews, secureHeaders, fetchAllReviews } = useOutletContext();
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = async (id, replyText) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${id}/reply`, {
        method: 'PUT',
        headers: secureHeaders,
        body: replyText
      });
      if (response.ok) {
        fetchAllReviews();
        setReplyToId(null);
      }
    } catch (err) {
      console.error("Reply failed:", err);
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

  return (
    <section className={styles.inventorySection}>
      <h1>Review & Moderation</h1>
      <table className={styles.inventoryTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Customer</th>
            <th>Rating</th>
            <th>Comment & Reply</th>
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
                          style={{
                            width: '100%',
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response..."
                        />
                        <div style={{ marginTop: '5px' }}>
                          <button
                            onClick={() => handleReply(rev.id, replyText)}
                            style={{
                              padding: '2px 8px',
                              marginRight: '5px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Send
                          </button>
                          <button
                            onClick={() => setReplyToId(null)}
                            style={{
                              padding: '2px 8px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReplyToId(rev.id); setReplyText(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          textDecoration: 'underline',
                          padding: 0
                        }}
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
  );
};

export default ReviewsSection;