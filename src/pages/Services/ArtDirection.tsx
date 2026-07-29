import styles from './Services.module.css';

export default function ArtDirection() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>Art Direction</h1>
          <p className={styles.description}>
            Визуальная стратегия и управление стилем проекта. 
            От подбора референсов и атмосферы до контроля финального качества исполнения. 
            Создание цельной визуальной истории, которая резонирует с аудиторией.
          </p>
        </div>
      </div>

      <div className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h3>Сертификаты и обучение</h3>
          <ul>
            <li>✓ Графический дизайнер PRO (Skillbox)</li>
            <li>✓ Дизайнер логотипа и фирменного стиля (Skillbox)</li>
            <li>✓ Насмотренность в UX/UI (Нетология)</li>
            <li>✓ Шрифт в дизайне (Skillbox)</li>
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h3>Навыки и инструменты</h3>
          <p>
            Композиция, типографика, колористика, архитектура бренда.<br/>
            Управление творческими задачами и соответствие бизнес-целям.
          </p>
        </div>
      </div>
    </div>
  )
}
