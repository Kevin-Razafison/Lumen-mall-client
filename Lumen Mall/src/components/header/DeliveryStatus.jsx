import React from "react";
import styles from "./DeliveryStatus.module.css";
import { useLocation } from "react-router-dom";

const DeliveryStatus = ({ location, onClick }) => {
    const { isDetecting } = useLocation(); // Get loading state from context

    return (
        <div className={styles.container} onClick={onClick}>
            <div className={styles.iconSection}>
                <img src="/icons/icons-position.png" alt="location" />
            </div>
            <div className={styles.textSection}>
                <span className={styles.label}>Deliver to</span>
                {isDetecting ? (
                    <div className={styles.skeleton}></div> // Show shimmer
                ) : (
                    <span className={styles.location}>{location}</span>
                )}
            </div>
        </div>
    );
};

export default DeliveryStatus;