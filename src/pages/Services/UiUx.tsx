import styles from './Services.module.css';

export default function UiUx() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>UI / UX Design</h1>
          <p className={styles.description}>
            Проектирование удобных и интуитивно понятных цифровых интерфейсов. 
            Глубокое понимание пользовательских сценариев, создание прототипов, 
            адаптивная верстка макетов и работа с современными дизайн-системами.
          </p>
        </div>
      </div>

      <div className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h3>Сертификаты и обучение</h3>
          <ul>
            <li>✓ Обучение основам Figma (Нетология)</li>
            <li>✓ Насмотренность в UX/UI (Нетология)</li>
            <li>✓ Обзор главных инструментов дизайнера (Нетология)</li>
            <li>✓ Практика Frontend (Skillbox) — React, TS, Vue.js</li>
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h3>Навыки и инструменты</h3>
          <p>
            Figma, Webflow, React, TypeScript, Vue.js.<br/>
            Прототипирование, пользовательские сценарии, CI/CD, адаптив.
          </p>
        </div>
      </div>
    </div>
  )
}
