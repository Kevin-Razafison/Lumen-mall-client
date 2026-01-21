import React from 'react'
import Logo from './Logo'
import styles from './Header.module.css'
import SearchBar from './SearchBar'
import DeliveryStatus from './DeliveryStatus'
import UserAccount from './UserAccount'
import CartWidget from './CartWidget'

const Header = () => {
    return(
        <header className={styles.headerContainer}>
            <Logo />
            <SearchBar />
            <DeliveryStatus />
            <UserAccount />
            <CartWidget />
        </header>   
    )
}

export default Header