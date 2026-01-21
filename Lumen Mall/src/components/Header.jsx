import React from 'react'
import Logo from './Logo'
import styles from './Header.module.css'
import SearchBar from './SearchBar'

const Header = () => {
    return(
        <header className={styles.headerContainer}>
            <Logo />
            <SearchBar />
        </header>   
    )
}

export default Header