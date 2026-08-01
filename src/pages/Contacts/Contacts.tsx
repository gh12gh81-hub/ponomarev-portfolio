import { useTranslation } from '@/contexts/LanguageContext';
import { Seo } from '@/components/Seo/Seo';
import styles from './Contacts.module.css';

export default function Contacts() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.contacts}>
      <Seo
        title={language === 'ru' ? 'Контакты' : 'Contact'}
        description={language === 'ru'
          ? 'Связаться с графическим дизайнером Николаем Пономаревым и скачать CV.'
          : 'Contact graphic designer Nikolai Ponomarev and download the CV.'}
      />
      <div className={styles.container}>
        <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t('contacts.title') }} />

        <div className={styles.list}>
          <a href="tel:+79290417048" className={styles.item}>
            <span className={styles.label}>{t('contacts.phone')}</span>
            <span className={styles.value}>+7 929 041-70-48</span>
          </a>
          <a href="mailto:gh12gh81@gmail.com" className={styles.item}>
            <span className={styles.label}>{t('contacts.email')}</span>
            <span className={styles.value}>gh12gh81@gmail.com</span>
          </a>
          <a href="https://t.me/nponom1981" target="_blank" rel="noopener noreferrer" className={styles.item}>
            <span className={styles.label}>{t('contacts.telegram')}</span>
            <span className={styles.value}>@nponom1981</span>
          </a>
          {/* Behance */}
          <a href="https://www.behance.net/f3031831" target="_blank" rel="noopener noreferrer" className={styles.item}>
            <span className={styles.label}>Behance</span>
            <span className={styles.value}>/f3031831</span>
          </a>
        </div>

        <div className={styles.cvWrapper}>
          <a href="/cv.pdf" download className={styles.cvBtn}>
            {t('contacts.cvBtn')}
          </a>
        </div>
      </div>
    </div>
  );
}
