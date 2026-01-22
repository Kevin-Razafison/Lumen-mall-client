import React from "react";
import { Link } from "react-router-dom";
import styles from './Logo.module.css'
import logo from '../../assets/Lumen-Mall-logo.png'


const Logo = () => {
    return (
        <Link to="/" className={styles.LogoContainer}>
            <img src={logo} alt="logo" className={styles.LogoImg} />
        </Link>
    )
}

export default Logo