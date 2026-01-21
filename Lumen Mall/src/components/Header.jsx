import React from 'react'
import Logo from './Logo'
import styles from './Header.module.css'

const Header = () => {
    return(
        <header className={styles.headerContainer}>
            <Logo />
        </header>   
    )
}

export default Header