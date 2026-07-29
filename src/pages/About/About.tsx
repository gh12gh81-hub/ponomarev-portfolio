import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './About.module.css';

export default function About() {
  // Анимация появления элементов с задержкой (Stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className={styles.about}>
      <div className={styles.container}>
        
        <motion.h1 
          className={styles.name}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Nikolai<br/>Ponomarev
        </motion.h1>
        
        <motion.div 
          className={styles.intro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p>
            Я графический дизайнер. Работаю с брендингом, упаковкой, 
            цифровыми интерфейсами и моушн-дизайном. 
            Для меня дизайн — это не просто красота, а способ сделать 
            сложное простым и понятным.
          </p>
        </motion.div>

        <div className={styles.experience}>
          <h2>Области и услуги</h2>
          
          <motion.ul 
            className={styles.skills}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.li variants={itemVariants}>
              <Link to="/services/brand-identity" className={styles.link}>Brand Identity</Link>
            </motion.li>
            <motion.li variants={itemVariants}>
              <Link to="/services/packaging" className={styles.link}>Packaging</Link>
            </motion.li>
            <motion.li variants={itemVariants}>
              <Link to="/services/ui-ux" className={styles.link}>UI / UX Design</Link>
            </motion.li>
            <motion.li variants={itemVariants}>
              <Link to="/services/motion-design" className={styles.link}>Motion Design</Link>
            </motion.li>
            <motion.li variants={itemVariants}>
              <Link to="/services/art-direction" className={styles.link}>Art Direction</Link>
            </motion.li>
          </motion.ul>
        </div>

      </div>
    </div>
  );
}
