import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage';
import { RootState } from '@/store';
import styles from './ProjectDetail.module.css';

export default function ProjectDetail() {
  const { slug } = useParams();
  const projects = useSelector((state: RootState) => state.projects.items);
  
  const project = projects.find(p => p.slug === slug);
  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  // Состояния для лайтбокса и слайдера
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Блокировка скролла (безопасная для Lenis)
  useEffect(() => {
    if (lightboxOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }

    return () => {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [lightboxOpen]);

  // Открыть лайтбокс по индексу картинки
  const openLightbox = (index: number) => {
    setCurrentImgIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImgIndex(0);
  };

  // Предыдущая / Следующая картинка
  const goPrev = () => {
    if (galleryImages.length === 0) return;
    setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = () => {
    if (galleryImages.length === 0) return;
    setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  if (!project) {
    return (
      <div className={styles.notFound}>
        <h2>Проект не найден</h2>
        <Link to="/" className={styles.backLink}>← Вернуться к работам</Link>
      </div>
    );
  }

  // Фильтруем галерею (убираем hero и cover, чтобы не было повторов)
  const galleryImages = project.gallery.filter(
    img => img !== project.hero && img !== project.cover
  );

  return (
    <div className={styles.detail}>
      
      {/* 1. Герой страницы */}
      {project.hero ? (
        <div className={styles.cover}>
          <CloudinaryImage src={project.hero} alt={project.title} width={2000} />
          <div className={styles.coverGradient}></div>
          <div className={styles.coverInfo}>
            <div className={styles.coverMeta}>
              <span>{project.category}</span> / <span>{project.year}</span>
            </div>
            <h1 className={styles.title}>{project.title}</h1>
            {project.description && <p className={styles.description}>{project.description}</p>}
          </div>
        </div>
      ) : (
        <div className={styles.textHero}>
          <div className={styles.textHeroContent}>
            <div className={styles.coverMeta}>
              <span>{project.category}</span> / <span>{project.year}</span>
            </div>
            <h1 className={styles.title}>{project.title}</h1>
            {project.description && <p className={styles.description}>{project.description}</p>}
          </div>
        </div>
      )}

      {/* 2. Метаданные */}
      <div className={styles.metaBlock}>
        <div className={styles.metaItem}>
          <h3>Client</h3>
          <p>{project.client || 'N/A'}</p>
        </div>
        <div className={styles.metaItem}>
          <h3>Tools</h3>
          <p>{project.tools || 'Figma, Illustrator'}</p>
        </div>
      </div>

      {/* 3. Процесс */}
      {(project.challenge || project.solution) && (
        <div className={styles.storyBlock}>
          {project.challenge && (
            <div className={styles.storyItem}>
              <h3>Challenge</h3>
              <p>{project.challenge}</p>
            </div>
          )}
          {project.solution && (
            <div className={styles.storyItem}>
              <h3>Solution</h3>
              <p>{project.solution}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Галерея (шаг 2, без дублей) */}
      <div className={styles.gallery}>
        {galleryImages.length > 0 && (() => {
          const rows = [];
          for (let i = 0; i < galleryImages.length; i += 2) {
            const img1 = galleryImages[i];
            const img2 = galleryImages[i + 1];

            if (img2) {
              rows.push(
                <div key={img1} className={styles.galleryItemHalf}>
                  <div className={styles.clickableImage} onClick={() => openLightbox(i)}>
                    <CloudinaryImage src={img1} alt={`${project.title} - ${i + 1}`} width={900} />
                  </div>
                  <div className={styles.clickableImage} onClick={() => openLightbox(i + 1)}>
                    <CloudinaryImage src={img2} alt={`${project.title} - ${i + 2}`} width={900} />
                  </div>
                </div>
              );
            } else {
              rows.push(
                <div key={img1} className={styles.galleryItemFull} onClick={() => openLightbox(i)}>
                  <CloudinaryImage src={img1} alt={`${project.title} - ${i + 1}`} width={1600} />
                </div>
              );
            }
          }
          return rows;
        })()}
      </div>

      {/* 5. Следующий проект */}
      <div className={styles.nextProject}>
        <Link to={`/projects/${nextProject.slug}`}>
          <span>Next Project</span>
          <span>{nextProject.title} →</span>
        </Link>
      </div>

      {/* 6. Лайтбокс (со слайдером) */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div 
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Кнопка закрытия */}
            <button className={styles.closeBtn} onClick={closeLightbox}>✕</button>

            {/* Левая зона слайдера */}
            <div className={`${styles.navZone} ${styles.navLeft}`} onClick={goPrev}>
              <span className={styles.navArrow}>‹</span>
            </div>

            {/* Правая зона слайдера */}
            <div className={`${styles.navZone} ${styles.navRight}`} onClick={goNext}>
              <span className={styles.navArrow}>›</span>
            </div>

            {/* Сама картинка (Клик по ней = закрытие) */}
            <motion.div 
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeLightbox} // <-- КЛИК ПО ЦЕНТРУ ЗАКРЫВАЕТ
            >
              <CloudinaryImage src={galleryImages[currentImgIndex]} alt="Увеличенное изображение" width={2400} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
