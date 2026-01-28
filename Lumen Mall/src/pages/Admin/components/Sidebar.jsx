import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import LogoImg from '../../../assets/Lumen-Mall-logo.png';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <img src={LogoImg} alt="Lumen Logo" className={styles.adminLogo} />
        <h2>Lumen Admin</h2>
      </div>

      <nav className={styles.navMenu}>
        <ul>
          <li>
            <NavLink 
              to="/admin" 
              end 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/inventory" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/add-product" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Add Product
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Users
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/reviews" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              Reviews
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          className={styles.logoutBtn}
          onClick={() => window.location.href = '/'}
        >
          Exit Dashboard
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;