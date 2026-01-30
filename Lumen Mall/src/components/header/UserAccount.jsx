import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "../Modals/LogoutModal";
import styles from './UserAccount.module.css';

const UserAccount = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <LogoutModal 
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <div className={styles.mainWrapper}>
        <Link to={isAuthenticated ? "/profile" : "/login"} className={styles.container}>
          <div className={styles.iconSection}>
            <img src="/icons/icons-user.png" alt="user-icon" />
          </div>
          <div className={styles.textSection}>
            <span className={styles.greeting}>
              {isAuthenticated ? `Hello, ${user.fullName.split(' ')[0]}` : "Welcome"}
            </span>
            <span className={styles.actionText}>
              {isAuthenticated ? "Account & Lists" : "Login/Sign up"}
            </span>
          </div>
        </Link>
        {isAuthenticated && (
          <button onClick={handleLogoutClick} className={styles.logoutBtn}>
            Sign Out
          </button>
        )}
      </div>
    </>
  );
};

export default UserAccount;