import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu, LuX, LuMapPin, LuUser, LuShoppingCart } from 'react-icons/lu';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import LogoutModal from '../../Modals/LogoutModal';
import { useSearch } from '../../hooks/useSearch.js';
import { useSearchParams } from 'react-router-dom'; // only needed for sync effect
import styles from './MobileHeader.module.css';
import logo from '../../../assets/Lumen-Mall-logo.png';

const MobileHeader = ({ openLocationModal, location }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchParams] = useSearchParams(); // for syncing input with URL

  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { updateSearchURL } = useSearch();

  // Sync input with URL search param
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchURL(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    updateSearchURL(''); // ✅ clear URL search param
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsMenuOpen(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <LogoutModal 
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <header className={styles.mobileHeader}>
        <div className={styles.topRow}>
          <button 
            className={styles.menuButton} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
          </button>

          <Link to="/" className={styles.logo}>
            <img src={logo} alt="Lumen Mall" />
          </Link>

          <Link to="/cart" className={styles.cartButton}>
            <LuShoppingCart size={24} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
        </div>

        <div className={styles.searchRow}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search Lumen Mall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}   // ✅ now clears both input and URL
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className={styles.searchButton} aria-label="Search">
              <img src="/icons/icons-search.png" alt="" />
            </button>
          </form>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      {isMenuOpen && (
        <>
          <div className={styles.backdrop} onClick={toggleMenu} />
          <nav className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2>Menu</h2>
            </div>

            <div className={styles.drawerContent}>
              {/* User Account Section */}
              <Link 
                to={isAuthenticated ? "/profile" : "/login"} 
                className={styles.menuItem}
                onClick={toggleMenu}
              >
                <LuUser size={24} className={styles.menuIcon} />
                <div className={styles.menuText}>
                  <span className={styles.menuLabel}>
                    {isAuthenticated ? `Hello, ${user.fullName.split(' ')[0]}` : "Welcome"}
                  </span>
                  <span className={styles.menuValue}>
                    {isAuthenticated ? "Account & Lists" : "Login/Sign up"}
                  </span>
                </div>
              </Link>

              {/* Delivery Location Section */}
              <button 
                className={styles.menuItem}
                onClick={() => {
                  openLocationModal();
                  toggleMenu();
                }}
              >
                <LuMapPin size={24} className={styles.menuIcon} />
                <div className={styles.menuText}>
                  <span className={styles.menuLabel}>Deliver to</span>
                  <span className={styles.menuValue}>{location}</span>
                </div>
              </button>

              {/* Sign Out Button */}
              {isAuthenticated && (
                <button 
                  onClick={handleLogoutClick}
                  className={styles.signOutButton}
                >
                  Sign Out
                </button>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default MobileHeader;