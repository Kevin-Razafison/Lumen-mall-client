import React from "react";
import styles from './Logo.module.css'
import logo from '../../assets/Lumen-Mall-logo.png'


const Logo = () => {
    return (
        <div className={styles.LogoContainer}>
            <img src={logo} alt="logo" className={styles.LogoImg} />
        </div>
    )
}

export default Logo