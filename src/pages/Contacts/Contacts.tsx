import styles from './Contacts.module.css'

export default function Contacts() {
  return (
    <div className={styles.contacts}>
      <div className={styles.container}>
        <h1 className={styles.title}>Свяжитесь<br/>со мной</h1>

        <div className={styles.list}>
          {/* Телефон */}
          <a href="tel:+79290417048" className={styles.item}>
            <span className={styles.label}>Телефон</span>
            <span className={styles.value}>+7 929 041-70-48</span>
          </a>

          {/* Почта */}
          <a href="mailto:gh12gh81@gmail.com" className={styles.item}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>gh12gh81@gmail.com</span>
          </a>

          {/* Telegram */}
          <a href="https://t.me/nponom1981" target="_blank" rel="noopener noreferrer" className={styles.item}>
            <span className={styles.label}>Telegram</span>
            <span className={styles.value}>@nponom1981</span>
          </a>

          {/* Сайт (Замени на свой домен, если есть) */}
          <a href="https://your-website.com" target="_blank" rel="noopener noreferrer" className={styles.item}>
            <span className={styles.label}>Сайт</span>
            <span className={styles.value}>your-website.com</span>
          </a>
        </div>
      </div>
    </div>
  )
}
