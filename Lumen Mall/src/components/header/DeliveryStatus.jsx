import React from "react";
import styles from "./DeliveryStatus.module.css";

const DeliveryStatus = ({ location, onClick }) => {
    // Check if location is the default to apply conditional styling if needed
    const isDefault = location === 'Select your address';

    return (
        <div className={styles.container} onClick={onClick} title={location}>
            <div className={styles.iconSection}>
                {/* Ensure this path is correct in your public folder */}
                <img src="/icons/icons-position.png" alt="location pin" />
            </div>
            <div className={styles.textSection}>
                <span className={styles.label}>Deliver to</span>
                <span className={`${styles.location} ${isDefault ? styles.highlight : ''}`}>
                    {location}
                </span>
            </div>
        </div>
    );
};

export default DeliveryStatus;