import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchProjects } from '@/features/projectsSlice'
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage'
import { Seo } from '@/components/Seo/Seo'
import { useTranslation } from '@/contexts/LanguageContext' // <-- Хук
import { AppDispatch, RootState } from '@/store'
import styles from './Home.module.css'

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: projects, status } = useSelector((state: RootState) => state.projects)
  const [visibleCount, setVisibleCount] = useState(6)
  const { t, language } = useTranslation() // <-- Подключаем

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProjects())
  }, [status, dispatch])

  const loadMore = () => setVisibleCount(prev => prev + 4)

  const moveProjectLabel = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth <= 768) return

    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    card.style.setProperty('--project-title-x', `${x}px`)
    card.style.setProperty('--project-title-y', `${y}px`)
  }

  return (
    <div className={styles.home}>
      <Seo
        title={language === 'ru' ? 'Николай Пономарев — графический дизайнер' : 'Nikolai Ponomarev — Graphic Designer'}
        description={language === 'ru'
          ? 'Портфолио графического дизайнера Николая Пономарева: брендинг, упаковка, UI/UX и motion design.'
          : 'Graphic designer Nikolai Ponomarev’s portfolio: branding, packaging, UI/UX and motion design.'}
      />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* Заменяем текст на t() */}
          <h1 dangerouslySetInnerHTML={{ __html: t('home.title') }} />
          <div className={styles.servicesTags}>
            <span>{t('home.branding')}</span>
            <span className={styles.dot}></span>
            <span>{t('home.packaging')}</span>
            <span className={styles.dot}></span>
            <span>{t('home.ui')}</span>
            <span className={styles.dot}></span>
            <span>{t('home.motion')}</span>
          </div>
          <div className={styles.scrollHint}>{t('home.scroll')}</div>
        </div>
      </section>

      <section className={styles.gallery}>
        {Array.isArray(projects) && projects.filter(p => p.cover).slice(0, visibleCount).map((project, idx) => {
          let layoutClass = styles.gridItem
          if (project.layout === 'wide') layoutClass += ` ${styles.wide}`
          if (project.layout === 'tall') layoutClass += ` ${styles.tall}`
          const imageSizes = project.layout === 'wide'
            ? '(max-width: 768px) 100vw, 66vw'
            : '(max-width: 768px) 100vw, 33vw'

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className={layoutClass}
            >
              <Link
                to={`/projects/${project.slug}`}
                className={`hoverable ${styles.projectLink}`}
                onMouseEnter={moveProjectLabel}
                onMouseMove={moveProjectLabel}
              >
                <CloudinaryImage src={project.cover} alt={project.title} width={1600} sizes={imageSizes} />
                <div className={styles.overlay}>
                  <div className={styles.floatingProjectLabel}>
                    <span className={styles.title}>{project.title}</span>
                    <span className={styles.category}>{project.category}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </section>

      {projects.filter(p => p.cover).length > visibleCount && (
        <div className={styles.loadMoreWrapper}>
          <button onClick={loadMore} className={styles.loadMoreBtn}>
            {t('home.loadMore')}
          </button>
        </div>
      )}
    </div>
  )
}
