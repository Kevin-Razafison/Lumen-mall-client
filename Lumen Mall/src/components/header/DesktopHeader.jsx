import React from 'react';
import Logo from './Logo';
import styles from './DesktopHeader.module.css';
import SearchBar from './SearchBar';
import DeliveryStatus from './DeliveryStatus';
import UserAccount from './UserAccount';
import CartWidget from './CartWidget';

const DesktopHeader = ({ openLocationModal }) => {
  return (
    <header className={styles.headerContainer}>
      <Logo />
      <SearchBar />
      <DeliveryStatus onClick={openLocationModal} />
      <UserAccount />
      <CartWidget />
    </header>   
  );
};

export default DesktopHeader;