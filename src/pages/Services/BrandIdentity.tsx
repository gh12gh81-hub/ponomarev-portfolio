import styles from './Services.module.css';

export default function BrandIdentity() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>Brand Identity</h1>
          <p className={styles.description}>
            Системный подход к визуалу бренда. Разработка идей, логотипов, цветовых палитр 
            и полных брендбуков, которые работают на долгосрочную узнаваемость компании.
          </p>
        </div>
      </div>

      <div className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h3>Сертификаты и обучение</h3>
          <ul>
            <li>✓ Дизайнер логотипа и фирменного стиля (Skillbox)</li>
            <li>✓ Графический дизайн с нуля 2.0 (Skillbox)</li>
            <li>✓ Шрифт в дизайне (Skillbox)</li>
            <li>✓ Практика по графическому дизайну (Skillbox)</li>
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h3>Навыки и инструменты</h3>
          <p>
            Adobe Illustrator, Photoshop, Figma, InDesign.<br/>
            Глубокая типографика, цветокоррекция, создание гайдлайнов и векторная графика.
          </p>
        </div>
      </div>
    </div>
  )
}
