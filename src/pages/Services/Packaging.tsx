import styles from './Services.module.css';

export default function Packaging() {
  return (
    <div className={styles.detail}>
      <div className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <h1 className={styles.title}>Packaging Design</h1>
          <p className={styles.description}>
            Создание эстетичной и продающей упаковки, которая выделяется на полке. 
            Анализ рыночных трендов, эргономика формы, работа с материалами 
            и визуальная передача ценности продукта.
          </p>
        </div>
      </div>

      <div className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h3>Сертификаты и обучение</h3>
          <ul>
            <li>✓ Дизайнер упаковки (Skillbox)</li>
            <li>✓ InDesign (Skillbox)</li>
            <li>✓ Adobe Illustrator с нуля (Skillbox)</li>
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h3>Навыки и инструменты</h3>
          <p>
            Adobe Illustrator, InDesign, Photoshop.<br/>
            Макетирование, понимание физики материалов, препресс и постпечатная обработка.
          </p>
        </div>
      </div>
    </div>
  )
}
