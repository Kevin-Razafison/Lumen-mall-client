import React from 'react';
import styles from './LogoutModal.module.css';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Confirm Sign Out</h3>
        <p className={styles.modalMessage}>
          Are you sure you want to sign out of your account?
        </p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Yes, Sign Out
          </button>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;