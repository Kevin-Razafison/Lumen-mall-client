import React from "react";
import styles from './Hero.module.css';
import heroImage from '../../assets/hero-image.png'

const Hero = () => {
    return(
        <section
            className={styles.hero}
            style={{backgroundImage: `url(${heroImage})`}}
        >
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.title}>NEXT-GEN TECH</h1>
                    <p className={styles.subtitle}>Experience Tomorrow, Today.</p>
                    <button className={styles.shopBtn}>Shop Now</button>
                </div>
            </div>
        </section>
    );
};

export default Hero