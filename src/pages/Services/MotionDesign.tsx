import styles from './Services.module.css';

export default function MotionDesign() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>Motion Design</h1>
          <p className={styles.description}>
            Оживление статичного контента. Создание рекламных роликов, 
            эффектных презентаций, анимированных HUD-элементов для игр 
            и динамичных лендингов, притягивающих внимание зрителя.
          </p>
        </div>
      </div>

      <div className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h3>Сертификаты и обучение</h3>
          <ul>
            <li>✓ Графический дизайнер PRO (Skillbox)</li>
            <li>✓ Adobe Illustrator с нуля 2.0 (Skillbox)</li>
            <li>✓ InDesign (Skillbox)</li>
            <li>✓ Практика Frontend (Skillbox) — анимация через код</li>
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h3>Навыки и инструменты</h3>
          <p>
            Adobe After Effects, Premiere Pro, Illustrator, Figma.<br/>
            Анимация, переходы, визуальные эффекты, композитинг.
          </p>
        </div>
      </div>
    </div>
  )
}
