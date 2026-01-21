import React from 'react'
import Logo from './Logo'
import styles from './Header.module.css'
import SearchBar from './SearchBar'
import DeliveryStatus from './DeliveryStatus'

const Header = () => {
    return(
        <header className={styles.headerContainer}>
            <Logo />
            <SearchBar />
            <DeliveryStatus />
        </header>   
    )
}

export default Header