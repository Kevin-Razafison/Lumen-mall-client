import styles from './Footer.module.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.backToTop} onClick={scrollToTop}>
        Return to top ^
      </div>

      <div className={styles.footerMain}>
        <div className={styles.linksContainer}>
          <a href="/about" className={styles.link}>about</a>
          <a href="/privacy" className={styles.link}>Privacy Policy</a>
        </div>
      </div>
      
      <div className={styles.copyright}>
        © 2026 Lumen Mall. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;