import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import { typography } from '@/utils/typography';
import { Seo } from '@/components/Seo/Seo';
import styles from './Services.module.css';

export default function Services() {
  const { t, language } = useTranslation();

  return (
    <div className={styles.detail}>
      <Seo
        title={language === 'ru' ? 'Услуги графического дизайна' : 'Graphic Design Services'}
        description={language === 'ru'
          ? 'Брендинг, упаковка, UI/UX, motion design и арт-дирекшн от Николая Пономарева.'
          : 'Branding, packaging, UI/UX, motion design and art direction by Nikolai Ponomarev.'}
      />
      <div className={styles.textHero} style={{ height: '50vh' }}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>{t('services.title')}</h1>
          <p className={styles.description}>{typography(t('services.subtitle'))}</p>
        </div>
      </div>
      <div className={styles.servicesGrid}>
        <Link to="/services/brand-identity" className={styles.serviceCard}>
          <h2>{t('services.brandIdentity')}</h2>
          <p>{typography(t('services.brandDesc'))}</p>
        </Link>
        <Link to="/services/packaging" className={styles.serviceCard}>
          <h2>{t('services.packaging')}</h2>
          <p>{typography(t('services.packagingDesc'))}</p>
        </Link>
        <Link to="/services/ui-ux" className={styles.serviceCard}>
          <h2>{t('services.uiux')}</h2>
          <p>{typography(t('services.uiuxDesc'))}</p>
        </Link>
        <Link to="/services/motion-design" className={styles.serviceCard}>
          <h2>{t('services.motion')}</h2>
          <p>{typography(t('services.motionDesc'))}</p>
        </Link>
        <Link to="/services/art-direction" className={`${styles.serviceCard} ${styles.serviceCardWide}`}>
          <h2>{t('services.artDirection')}</h2>
          <p>{typography(t('services.artDesc'))}</p>
        </Link>
      </div>
    </div>
  );
}
