import React from "react";
import styles from "./DeliveryStatus.module.css"

const DeliveryStatus = ({ location="Madagascar" }) => {
    return (
        <div className={styles.container}>
            <div className={styles.iconSection}>
                <img src="/icons/icons-position.png" alt="location" />
            </div>
            <div className={styles.textSection}>
                <span className={styles.label}>Deliver to</span>
                <span className={styles.location}>{location}</span>
            </div>
        </div>
    )
}

export default DeliveryStatus