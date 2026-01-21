import React from "react";
import styles from './UserAccount.module.css'

const UserAccount = ({ userName = "Login/Sign up"}) => {
    return (
        <div className={styles.container}>
            <div className={styles.iconSection}>
                <img src="/icons/icons-user.png" alt="user-icon" />
            </div>
            <div className={styles.textSection}>
                <span className={styles.greeting}>Welcome</span>
                <span className={styles.actionText}>{userName}</span>
            </div>
        </div>
    )
}
export default UserAccount