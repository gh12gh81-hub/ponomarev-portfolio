import { Link } from 'react-router-dom';
import { useScroll } from '@/hooks/useScroll';
import styles from './Header.module.css';

export const Header = () => {
  const isScrolled = useScroll(80);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>NIKOLAI PONOMAREV</Link>
      <nav className={styles.nav}>
        <Link to="/">WORK</Link>
        <Link to="/services">SERVICES</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contacts">CONTACT</Link>
      </nav>
    </header>
  );
};
