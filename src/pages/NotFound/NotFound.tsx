import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';
import { Seo } from '@/components/Seo/Seo';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { t, language } = useTranslation();
  return (
    <motion.div 
      className={styles.notFound} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
    >
      <Seo
        title={language === 'ru' ? 'Страница не найдена' : 'Page not found'}
        description={language === 'ru' ? 'Запрошенная страница не найдена.' : 'The requested page could not be found.'}
        noIndex
      />
      <div className={styles.container}>
        <h1 className={styles.code}>{t('notFound.code')}</h1>
        <p className={styles.text}>{t('notFound.title')}</p>
        <p className={styles.subtext}>{t('notFound.sub')}</p>
        <Link to="/" className={styles.link}>{t('notFound.back')}</Link>
      </div>
    </motion.div>
  );
}
