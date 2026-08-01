import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage';
import { Seo } from '@/components/Seo/Seo';
import { useTranslation } from '@/contexts/LanguageContext';
import { typography } from '@/utils/typography';
import { fetchProjects } from '@/features/projectsSlice';
import { AppDispatch, RootState } from '@/store';
import styles from './ProjectDetail.module.css';

const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;
type LightboxCursorAction = 'prev' | 'next' | 'close';
const lightboxSlideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%' }),
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { items: projects, status } = useSelector((state: RootState) => state.projects);
  const { t, language } = useTranslation();

  const project = projects.find(p => p.slug === slug);
  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const galleryImages = project?.gallery.filter(
    img => img !== project.hero && img !== project.cover
  ) ?? [];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [slideDirection, setSlideDirection] = useState(1);
  const [lightboxCursor, setLightboxCursor] = useState<LightboxCursorAction | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const glassCursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setSlideDirection(1);
    setCurrentImgIndex(index);
    setLightboxSrc(galleryImages[index]);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImgIndex(0);
    setLightboxSrc('');
    setSlideDirection(1);
    setLightboxCursor(null);
  };

  const goPrev = () => {
    if (galleryImages.length === 0) return;
    setSlideDirection(-1);
    const newIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
    setCurrentImgIndex(newIndex);
    setLightboxSrc(galleryImages[newIndex]);
  };

  const goNext = () => {
    if (galleryImages.length === 0) return;
    setSlideDirection(1);
    const newIndex = (currentImgIndex + 1) % galleryImages.length;
    setCurrentImgIndex(newIndex);
    setLightboxSrc(galleryImages[newIndex]);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth > MOBILE_BREAKPOINT || event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    didSwipe.current = false;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || window.innerWidth > MOBILE_BREAKPOINT || event.changedTouches.length === 0) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    didSwipe.current = true;
    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const handleLightboxImageClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }

    closeLightbox();
  };

  const positionGlassCursor = (event: ReactMouseEvent<HTMLElement>) => {
    if (window.innerWidth <= MOBILE_BREAKPOINT || !glassCursorRef.current) return;

    glassCursorRef.current.style.transform =
      `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  };

  const showGlassCursor = (
    action: LightboxCursorAction,
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    setLightboxCursor(action);
    positionGlassCursor(event);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (window.innerWidth <= MOBILE_BREAKPOINT) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImgIndex, galleryImages.length]);

  if (status === 'failed') {
    return (
      <div className={styles.errorState}>
        <p>{t('project.error')}</p>
        <button onClick={() => dispatch(fetchProjects())} className={styles.retryBtn}>
          {t('project.retry')}
        </button>
      </div>
    );
  }

  if (!project && status === 'succeeded') {
    return (
      <div className={styles.notFound}>
        <h2>404</h2>
        <Link to="/" className={styles.backLink}>← {t('notFound.back')}</Link>
      </div>
    );
  }

  if (!project) {
    return <div className={styles.loading}>{t('project.loading')}</div>;
  }

  const projectKey = 'projectDetails.' + slug;

  const getDescription = () => {
    const projectCopy = project.translations?.[language];
    if (projectCopy) return projectCopy.description;
    const translated = t(projectKey + '.description');
    if (translated.startsWith('projectDetails.')) return project.description || '';
    return translated;
  };

  const getChallenge = () => {
    const projectCopy = project.translations?.[language];
    if (projectCopy) return projectCopy.challenge;
    const translated = t(projectKey + '.challenge');
    if (translated.startsWith('projectDetails.')) return project.challenge || '';
    return translated;
  };

  const getSolution = () => {
    const projectCopy = project.translations?.[language];
    if (projectCopy) return projectCopy.solution;
    const translated = t(projectKey + '.solution');
    if (translated.startsWith('projectDetails.')) return project.solution || '';
    return translated;
  };

  const getClient = () => {
    const projectCopy = project.translations?.[language];
    if (projectCopy) return projectCopy.client || 'N/A';
    const translated = t(projectKey + '.client');
    if (translated.startsWith('projectDetails.')) return project.client || 'N/A';
    return translated;
  };

  const localizedDescription = getDescription();
  const localizedChallenge = getChallenge();
  const localizedSolution = getSolution();

  return (
    <div className={styles.detail}>
      <Seo
        title={`${project.title} — ${language === 'ru' ? 'проект' : 'project'}`}
        description={localizedDescription}
        image={project.cover}
      />
      <div className={styles.headerInfo}>
        <div className={styles.coverMeta}>
          <span>{typography(project.category)}</span> / <span>{project.year}</span>
        </div>
        <h1 className={styles.title}>{typography(project.title)}</h1>
        <p className={styles.description}>
          {typography(localizedDescription)}
        </p>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <h2>{t('project.client')}</h2>
          <p>{getClient()}</p>
        </div>
        <div className={styles.infoItem}>
          <h2>{t('project.tools')}</h2>
          <p>{project.tools || 'Figma, Illustrator'}</p>
        </div>

        {localizedChallenge && (
          <div className={styles.infoItem}>
            <h2>{t('project.challenge')}</h2>
            <p>{typography(localizedChallenge)}</p>
          </div>
        )}
        {localizedSolution && (
          <div className={styles.infoItem}>
            <h2>{t('project.solution')}</h2>
            <p>{typography(localizedSolution)}</p>
          </div>
        )}
      </div>

      <div className={styles.heroImage}>
        <CloudinaryImage src={project.hero || project.cover} alt={project.title} width={2000} sizes="100vw" />
      </div>

      <div className={styles.gallery}>
        {galleryImages.length > 0 && (() => {
          const rows = [];
          for (let i = 0; i < galleryImages.length; i += 2) {
            const img1 = galleryImages[i];
            const img2 = galleryImages[i + 1];

            if (img2) {
              rows.push(
                <div key={img1} className={styles.galleryItemHalf}>
                  <button
                    type="button"
                    className={styles.clickableImage}
                    onClick={() => openLightbox(i)}
                    aria-label={language === 'ru'
                      ? `Открыть изображение ${i + 1} проекта ${project.title}`
                      : `Open image ${i + 1} from ${project.title}`}
                  >
                    <CloudinaryImage src={img1} alt={`${project.title} - ${i + 1}`} width={900} sizes="(max-width: 768px) 100vw, 50vw" />
                  </button>
                  <button
                    type="button"
                    className={styles.clickableImage}
                    onClick={() => openLightbox(i + 1)}
                    aria-label={language === 'ru'
                      ? `Открыть изображение ${i + 2} проекта ${project.title}`
                      : `Open image ${i + 2} from ${project.title}`}
                  >
                    <CloudinaryImage src={img2} alt={`${project.title} - ${i + 2}`} width={900} sizes="(max-width: 768px) 100vw, 50vw" />
                  </button>
                </div>
              );
            } else {
              rows.push(
                <button
                  key={img1}
                  type="button"
                  className={styles.galleryItemFull}
                  onClick={() => openLightbox(i)}
                  aria-label={language === 'ru'
                    ? `Открыть изображение ${i + 1} проекта ${project.title}`
                    : `Open image ${i + 1} from ${project.title}`}
                >
                  <CloudinaryImage src={img1} alt={`${project.title} - ${i + 1}`} width={1600} sizes="100vw" />
                </button>
              );
            }
          }
          return rows;
        })()}
      </div>

      <div className={styles.nextProject}>
        <Link to={`/projects/${nextProject.slug}`}>
          <span className={styles.nextProjectLabel}>{t('project.next')}</span>
          <span className={styles.nextProjectTitle}>{nextProject.title} →</span>
        </Link>
      </div>

      {createPortal(
        <AnimatePresence>
          {lightboxOpen && galleryImages.length > 0 && (
            <motion.div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={language === 'ru' ? 'Просмотр изображений проекта' : 'Project image viewer'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeLightbox}
                aria-label={language === 'ru' ? 'Закрыть просмотр изображений' : 'Close image viewer'}
              >✕</button>
              <button
                type="button"
                aria-label="Предыдущее изображение"
                className={`${styles.navZone} ${styles.navLeft}`}
                onClick={goPrev}
                onMouseEnter={(event) => showGlassCursor('prev', event)}
                onMouseMove={(event) => showGlassCursor('prev', event)}
                onMouseLeave={() => setLightboxCursor(null)}
              />
              <button
                type="button"
                aria-label="Следующее изображение"
                className={`${styles.navZone} ${styles.navRight}`}
                onClick={goNext}
                onMouseEnter={(event) => showGlassCursor('next', event)}
                onMouseMove={(event) => showGlassCursor('next', event)}
                onMouseLeave={() => setLightboxCursor(null)}
              />
              <motion.div
                className={styles.lightboxContent}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleLightboxImageClick}
                onMouseEnter={(event) => showGlassCursor('close', event)}
                onMouseMove={(event) => showGlassCursor('close', event)}
                onMouseLeave={() => setLightboxCursor(null)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => {
                  touchStart.current = null;
                  didSwipe.current = false;
                }}
              >
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.div
                    key={currentImgIndex}
                    className={styles.lightboxSlide}
                    custom={slideDirection}
                    variants={lightboxSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CloudinaryImage
                      src={lightboxSrc}
                      alt="Увеличенное изображение"
                      width={2400}
                      sizes="100vw"
                      loading="eager"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              <div
                ref={glassCursorRef}
                className={`${styles.glassCursor} ${lightboxCursor ? styles.glassCursorVisible : ''}`}
                aria-hidden="true"
              >
                <svg
                  className={styles.glassCursorIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {lightboxCursor === 'prev' && <path d="M15 5 8 12l7 7" />}
                  {lightboxCursor === 'next' && <path d="m9 5 7 7-7 7" />}
                  {lightboxCursor === 'close' && (
                    <>
                      <path d="m6 6 12 12" />
                      <path d="M18 6 6 18" />
                    </>
                  )}
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
