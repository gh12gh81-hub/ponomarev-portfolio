import { useTranslation } from '@/contexts/LanguageContext';
import styles from './Footer.module.css';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        {t('footer.text')}
      </p>
    </footer>
  );
};
