import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage';
import { CloudinaryVideo } from '@/components/CloudinaryVideo/CloudinaryVideo';
import { Seo } from '@/components/Seo/Seo';
import { useTranslation } from '@/contexts/LanguageContext';
import { typography } from '@/utils/typography';
import { fetchProjects } from '@/features/projectsSlice';
import { AppDispatch, RootState } from '@/store';
import { normalizeProjectMedia } from '@/utils/projectMedia';
import styles from './ProjectDetail.module.css';

const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;
const VIDEO_CONTROLS_MAX_HEIGHT = 72;
type LightboxCursorAction = 'prev' | 'next' | 'close';
const lightboxSlideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%' }),
};

const supportsTouchNavigation = () => (
  window.innerWidth <= 1024
  && (
    window.innerWidth <= MOBILE_BREAKPOINT
    || window.matchMedia('(pointer: coarse)').matches
    || navigator.maxTouchPoints > 0
  )
);

const isVideoFullscreen = (video: HTMLVideoElement) => (
  document.fullscreenElement === video
  || Boolean((video as HTMLVideoElement & { webkitDisplayingFullscreen?: boolean }).webkitDisplayingFullscreen)
);

export default function ProjectDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { items: projects, status } = useSelector((state: RootState) => state.projects);
  const { t, language } = useTranslation();

  const project = projects.find(p => p.slug === slug);
  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const previousProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const galleryMedia = project?.gallery
    .map(normalizeProjectMedia)
    .filter(media => media.src !== project.hero && media.src !== project.cover) ?? [];
  const heroMedia = project
    ? normalizeProjectMedia(project.hero || project.cover)
    : null;
  const lightboxMediaItems = heroMedia
    ? [heroMedia, ...galleryMedia]
    : galleryMedia;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [lightboxMuted, setLightboxMuted] = useState(true);
  const [lightboxCursor, setLightboxCursor] = useState<LightboxCursorAction | null>(null);
  const [mediaAspectRatios, setMediaAspectRatios] = useState<Record<string, number>>({});
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
    setLightboxMuted(true);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImgIndex(0);
    setSlideDirection(1);
    setLightboxMuted(true);
    setLightboxCursor(null);
  };

  const goPrev = () => {
    if (lightboxMediaItems.length === 0) return;
    setSlideDirection(-1);
    setLightboxMuted(true);
    const newIndex = (currentImgIndex - 1 + lightboxMediaItems.length) % lightboxMediaItems.length;
    setCurrentImgIndex(newIndex);
  };

  const goNext = () => {
    if (lightboxMediaItems.length === 0) return;
    setSlideDirection(1);
    setLightboxMuted(true);
    const newIndex = (currentImgIndex + 1) % lightboxMediaItems.length;
    setCurrentImgIndex(newIndex);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = null;
    didSwipe.current = false;
    if (!supportsTouchNavigation() || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (video) {
      if (isVideoFullscreen(video)) return;
      const bounds = video.getBoundingClientRect();
      const controlsHeight = Math.min(VIDEO_CONTROLS_MAX_HEIGHT, bounds.height * 0.25);
      if (touch.clientY >= bounds.bottom - controlsHeight) return;
    }

    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || !supportsTouchNavigation() || event.changedTouches.length === 0) return;

    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (video && isVideoFullscreen(video)) return;

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
  }, [lightboxOpen, currentImgIndex, lightboxMediaItems.length]);

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
  const lightboxMedia = lightboxMediaItems[currentImgIndex];

  const mediaLabel = (index: number) => language === 'ru'
    ? `Открыть медиафайл ${index + 1} проекта ${project.title}`
    : `Open media ${index + 1} from ${project.title}`;

  const rememberMediaAspectRatio = (key: string, width: number, height: number) => {
    if (width <= 0 || height <= 0) return;
    const nextRatio = width / height;
    setMediaAspectRatios(current => (
      Math.abs((current[key] ?? 0) - nextRatio) < 0.001
        ? current
        : { ...current, [key]: nextRatio }
    ));
  };

  const mediaAspectRatioStyle = (index: number, fallback: string) => {
    const media = galleryMedia[index];
    const ratio = mediaAspectRatios[`${media.type}:${media.src}`];
    return { aspectRatio: ratio ? String(ratio) : fallback };
  };

  const renderGalleryMedia = (index: number, width: number, sizes: string) => {
    const media = galleryMedia[index];
    const mediaKey = `${media.type}:${media.src}`;
    if (media.type === 'video') {
      return (
        <CloudinaryVideo
          src={media.src}
          poster={media.poster}
          width={width}
          autoPlay
          loop
          muted
          preload="metadata"
          ariaLabel={`${project.title} - ${index + 1}`}
          onLoadedMetadata={event => rememberMediaAspectRatio(
            mediaKey,
            event.currentTarget.videoWidth,
            event.currentTarget.videoHeight,
          )}
        />
      );
    }
    return (
      <CloudinaryImage
        src={media.src}
        alt={`${project.title} - ${index + 1}`}
        width={width}
        sizes={sizes}
        onLoad={event => rememberMediaAspectRatio(
          mediaKey,
          event.currentTarget.naturalWidth,
          event.currentTarget.naturalHeight,
        )}
      />
    );
  };

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
          <p>{typography(getClient())}</p>
        </div>
        <div className={styles.infoItem}>
          <h2>{t('project.tools')}</h2>
          <p>{typography(project.tools || 'Figma, Illustrator')}</p>
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

      <button
        type="button"
        className={styles.heroImage}
        onClick={() => openLightbox(0)}
        aria-label={language === 'ru'
          ? `Открыть обложку проекта ${project.title}`
          : `Open ${project.title} project cover`}
      >
        <CloudinaryImage src={project.hero || project.cover} alt={project.title} width={2000} sizes="100vw" />
      </button>

      <div className={styles.gallery}>
        {galleryMedia.length > 0 && (() => {
          const rows = [];
          for (let i = 0; i < galleryMedia.length;) {
            const mediaIndex = i;
            const media1 = galleryMedia[mediaIndex];
            const media2 = galleryMedia[mediaIndex + 1];
            const isHalfPair = media1.layout === 'half' && media2?.layout === 'half';

            if (isHalfPair) {
              rows.push(
                <div key={`${media1.type}-${media1.src}-${mediaIndex}`} className={styles.galleryItemHalf}>
                  <button
                    type="button"
                    className={styles.clickableImage}
                    style={mediaAspectRatioStyle(mediaIndex, '4 / 3')}
                    onClick={() => openLightbox(mediaIndex + 1)}
                    aria-label={mediaLabel(mediaIndex)}
                  >
                    {renderGalleryMedia(mediaIndex, 900, '(max-width: 768px) 100vw, 50vw')}
                  </button>
                  <button
                    type="button"
                    className={styles.clickableImage}
                    style={mediaAspectRatioStyle(mediaIndex + 1, '4 / 3')}
                    onClick={() => openLightbox(mediaIndex + 2)}
                    aria-label={mediaLabel(mediaIndex + 1)}
                  >
                    {renderGalleryMedia(mediaIndex + 1, 900, '(max-width: 768px) 100vw, 50vw')}
                  </button>
                </div>
              );
              i += 2;
            } else {
              rows.push(
                <button
                  key={`${media1.type}-${media1.src}-${mediaIndex}`}
                  type="button"
                  className={styles.galleryItemFull}
                  style={mediaAspectRatioStyle(mediaIndex, '16 / 9')}
                  onClick={() => openLightbox(mediaIndex + 1)}
                  aria-label={mediaLabel(mediaIndex)}
                >
                  {renderGalleryMedia(mediaIndex, 1600, '100vw')}
                </button>
              );
              i += 1;
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
        <Link to={`/projects/${previousProject.slug}`} className={styles.previousProjectLink}>
          <span className={styles.nextProjectLabel}>{t('project.previous')}</span>
          <span className={styles.nextProjectTitle}>← {previousProject.title}</span>
        </Link>
      </div>

      {createPortal(
        <AnimatePresence>
          {lightboxOpen && lightboxMediaItems.length > 0 && lightboxMedia && (
            <motion.div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={language === 'ru' ? 'Просмотр медиафайлов проекта' : 'Project media viewer'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={event => {
                if (event.target === event.currentTarget) closeLightbox();
              }}
              onMouseMove={event => {
                if (event.target === event.currentTarget) showGlassCursor('close', event);
              }}
              onMouseLeave={() => setLightboxCursor(null)}
            >
              <button
                type="button"
                className={`${styles.closeBtn} ${lightboxMedia.type === 'video' ? styles.closeBtnVideo : ''}`}
                onClick={closeLightbox}
                aria-label={language === 'ru' ? 'Закрыть просмотр медиафайлов' : 'Close media viewer'}
              >
                <svg
                  className={styles.closeBtnIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
              {lightboxMedia.type === 'video' && (
                <button
                  type="button"
                  className={styles.videoSoundBtn}
                  onClick={() => setLightboxMuted(current => !current)}
                  aria-label={language === 'ru'
                    ? (lightboxMuted ? 'Включить звук видео' : 'Выключить звук видео')
                    : (lightboxMuted ? 'Unmute video' : 'Mute video')}
                  aria-pressed={!lightboxMuted}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
                    {lightboxMuted ? (
                      <>
                        <path d="m16 9 5 6" />
                        <path d="m21 9-5 6" />
                      </>
                    ) : (
                      <>
                        <path d="M15.5 9.5a4 4 0 0 1 0 5" />
                        <path d="M18 7a7 7 0 0 1 0 10" />
                      </>
                    )}
                  </svg>
                  <span>{language === 'ru' ? (lightboxMuted ? 'Звук' : 'Звук включён') : (lightboxMuted ? 'Sound' : 'Sound on')}</span>
                </button>
              )}
              <button
                type="button"
                aria-label={language === 'ru' ? 'Предыдущий медиафайл' : 'Previous media'}
                className={`${styles.navZone} ${styles.navLeft} ${lightboxMedia.type === 'video' ? styles.navZoneVideo : ''}`}
                onClick={goPrev}
                onMouseEnter={(event) => showGlassCursor('prev', event)}
                onMouseMove={(event) => showGlassCursor('prev', event)}
                onMouseLeave={() => setLightboxCursor(null)}
              />
              <button
                type="button"
                aria-label={language === 'ru' ? 'Следующий медиафайл' : 'Next media'}
                className={`${styles.navZone} ${styles.navRight} ${lightboxMedia.type === 'video' ? styles.navZoneVideo : ''}`}
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
                    key={`${lightboxMedia.type}-${lightboxMedia.src}-${currentImgIndex}`}
                    className={styles.lightboxSlide}
                    custom={slideDirection}
                    variants={lightboxSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {lightboxMedia.type === 'video' ? (
                      <CloudinaryVideo
                        src={lightboxMedia.src}
                        poster={lightboxMedia.poster}
                        className={styles.lightboxVideo}
                        width={2400}
                        autoPlay
                        controls
                        loop
                        muted={lightboxMuted}
                        preload="auto"
                        ariaLabel={language === 'ru' ? `Видео проекта ${project.title}` : `${project.title} project video`}
                        onClick={event => event.stopPropagation()}
                        onMouseEnter={event => {
                          event.stopPropagation();
                          setLightboxCursor(null);
                        }}
                        onMouseMove={event => {
                          event.stopPropagation();
                          setLightboxCursor(null);
                        }}
                        onMutedChange={setLightboxMuted}
                      />
                    ) : (
                      <CloudinaryImage
                        src={lightboxMedia.src}
                        alt="Увеличенное изображение"
                        width={2400}
                        sizes="100vw"
                        loading="eager"
                      />
                    )}
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
