import React from "react";
import styles from './CartWidget.module.css'

const CartWidget = ({itemCount = 0 }) =>{
    return(
        <div className={styles.cartContainer}>
            <div className={styles.iconWrapper}>
                <img src="/icons/icons-shopping-cart.png" alt="shopping-cart" className={styles.cartIcon} />
                {itemCount >=0 && (
                    <span className={styles.badge}>{itemCount}</span>
                )}  
            </div>
            <span className={styles.cartText}>Cart</span>
        </div>
    )
}

export default CartWidget