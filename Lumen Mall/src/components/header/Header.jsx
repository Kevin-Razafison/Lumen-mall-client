import React from 'react'
import Logo from './Logo'
import styles from './Header.module.css'
import SearchBar from './SearchBar'
import DeliveryStatus from './DeliveryStatus'
import UserAccount from './UserAccount'
import CartWidget from './CartWidget'
import { useLocation } from '../../context/LocationContext';
import { LuMapPin } from 'react-icons/lu';

const Header = ({ openLocationModal }) => {
  const { location } = useLocation();

  return (
    <header className={styles.headerContainer}>
      <Logo />
      <SearchBar />
      <DeliveryStatus 
        location={location} 
        onClick={openLocationModal} 
      />
      <UserAccount />
      <CartWidget />
    </header>   
  );
};

export default Header