import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from './CartWidget.module.css'

const CartWidget = () =>{
    const { cartCount } = useCart()
    return(
        <Link to="/cart" className={styles.cartContainer}>
            <div className={styles.iconWrapper}>
                <img src="/icons/icons-shopping-cart.png" alt="shopping-cart" className={styles.cartIcon} />
                {cartCount >=0 && (
                    <span className={styles.badge}>{cartCount}</span>
                )}  
            </div>
            <span className={styles.cartText}>Cart</span>
        </Link>
    )
}

export default CartWidget