import React from "react";
import styles from './Logo.module.css'

const Logo = () => {
    return (
        <div className={styles.LogoContainer}>
            <img src="/Lumen-Mall-logo.png" alt="logo" className={styles.LogoImg} />
        </div>
    )
}

export default Logo