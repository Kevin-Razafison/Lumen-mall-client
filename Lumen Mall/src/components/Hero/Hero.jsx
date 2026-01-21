import styles from './Hero.module.css';
import heroImg from '../../assets/hero-image.png'; 

const Hero = () => {
  return (
    <div className={styles.heroWrapper}>
      <section 
        className={styles.hero} 
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className={styles.content}>
          <h1 className={styles.title}>NEXT-GEN TECH</h1>
          <p className={styles.subtitle}>Experience Tomorrow, Today.</p>
          <button className={styles.shopBtn}>Shop Now</button>
        </div>
      </section>
    </div>
  );
};
export default Hero