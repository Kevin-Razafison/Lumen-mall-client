import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import hook
import styles from './UserAccount.module.css'

const UserAccount = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <div className={styles.container}>
            <Link to={isAuthenticated ? "/profile" : "/login"} className={styles.linkWrapper}>
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
            
            {/* Optional: Add a logout button that appears only when logged in */}
            {isAuthenticated && (
                <button onClick={logout} className={styles.logoutBtn}>Sign Out</button>
            )}
        </div>
    )
}
export default UserAccount