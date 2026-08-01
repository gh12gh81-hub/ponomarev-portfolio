import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScroll } from '@/hooks/useScroll';
import { useTranslation } from '@/contexts/LanguageContext'; // <-- Импорт
import styles from './Header.module.css';

export const Header = () => {
  const isScrolled = useScroll(80);
  const { t, language, toggleLanguage } = useTranslation(); // <-- Хук
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>NIKOLAI PONOMAREV</Link>
      <button
        type="button"
        className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
        onClick={() => setMenuOpen(open => !open)}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        aria-label={menuOpen
          ? (language === 'ru' ? 'Закрыть меню' : 'Close menu')
          : (language === 'ru' ? 'Открыть меню' : 'Open menu')}
      >
        <span />
        <span />
      </button>
      {menuOpen && (
        <button
          type="button"
          className={styles.menuBackdrop}
          onClick={() => setMenuOpen(false)}
          aria-label={language === 'ru' ? 'Закрыть меню' : 'Close menu'}
        />
      )}
      <nav id="main-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
        <Link to="/">{t('header.work')}</Link>
        <Link to="/services">{t('header.services')}</Link>
        <Link to="/about">{t('header.about')}</Link>
        <Link to="/contacts">{t('header.contact')}</Link>
        
        {/* Кнопка переключения языка */}
        <button onClick={toggleLanguage} className={styles.langBtn} aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}>
          {language === 'ru' ? 'EN' : 'RU'}
        </button>
      </nav>
    </header>
  );
};
