import { Link } from 'react-router-dom';
import styles from './Services.module.css';

export default function Services() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero} style={{ height: '50vh' }}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>Услуги</h1>
          <p className={styles.description}>
            Дизайн, который решает задачи. От идеи до реализации.
            Опираюсь на профессиональное образование и реальный опыт.
          </p>
        </div>
      </div>

      <div className={styles.servicesGrid}>
        <Link to="/services/brand-identity" className={styles.serviceCard}>
          <h2>Brand Identity</h2>
          <p>Логотипы, брендбуки, айдентика с нуля. Системный подход к визуалу бренда.</p>
        </Link>
        <Link to="/services/packaging" className={styles.serviceCard}>
          <h2>Packaging</h2>
          <p>Упаковка, которая выделяется. Анализ рынка, эргономика и продающая эстетика.</p>
        </Link>
        <Link to="/services/ui-ux" className={styles.serviceCard}>
          <h2>UI / UX Design</h2>
          <p>Интуитивные интерфейсы и прототипы. Проектирование цифровых продуктов.</p>
        </Link>
        <Link to="/services/motion-design" className={styles.serviceCard}>
          <h2>Motion Design</h2>
          <p>Оживление идей. Анимированные баннеры, HUD-элементы и презентации.</p>
        </Link>
        <Link to="/services/art-direction" className={styles.serviceCard} style={{ gridColumn: 'span 2' }}>
          <h2>Art Direction</h2>
          <p>Визуальная стратегия и управление стилем. Создание цельной истории бренда.</p>
        </Link>
      </div>
    </div>
  )
}
