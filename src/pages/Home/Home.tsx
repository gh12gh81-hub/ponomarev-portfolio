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
  const [visibleCount, setVisibleCount] = useState(7)
  const [coverAspectRatios, setCoverAspectRatios] = useState<Record<string, number>>({})
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

  const rememberCoverAspectRatio = (slug: string, width: number, height: number) => {
    if (width <= 0 || height <= 0) return
    const nextRatio = width / height
    setCoverAspectRatios(current => (
      Math.abs((current[slug] ?? 0) - nextRatio) < 0.001
        ? current
        : { ...current, [slug]: nextRatio }
    ))
  }

  const getCoverAspectRatio = (project: (typeof projects)[number]) => (
    coverAspectRatios[project.slug]
    ?? (project.layout === 'wide' ? 2 : project.layout === 'tall' ? 0.75 : 1)
  )

  const visibleProjects = Array.isArray(projects)
    ? projects.filter(project => project.cover).slice(0, visibleCount)
    : []
  const rowPattern = [2, 3, 2]
  const projectRows = []
  for (let index = 0, patternIndex = 0; index < visibleProjects.length; patternIndex += 1) {
    const rowSize = rowPattern[patternIndex % rowPattern.length]
    projectRows.push(visibleProjects.slice(index, index + rowSize))
    index += rowSize
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
        {projectRows.map((row, rowIndex) => (
          <div className={styles.galleryRow} key={row.map(project => project.id).join('-')}>
            {row.map((project, columnIndex) => {
              const projectIndex = projectRows
                .slice(0, rowIndex)
                .reduce((total, previousRow) => total + previousRow.length, 0) + columnIndex
              const coverAspectRatio = getCoverAspectRatio(project)

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: projectIndex * 0.1 }}
                  className={styles.gridItem}
                  style={{
                    flexGrow: coverAspectRatio,
                    aspectRatio: String(coverAspectRatio),
                  }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className={`hoverable ${styles.projectLink}`}
                    onMouseEnter={moveProjectLabel}
                    onMouseMove={moveProjectLabel}
                  >
                    <CloudinaryImage
                      src={project.cover}
                      alt={project.title}
                      width={1600}
                      sizes={row.length === 2
                        ? '(max-width: 768px) 100vw, 55vw'
                        : '(max-width: 768px) 100vw, 40vw'}
                      onLoad={event => rememberCoverAspectRatio(
                        project.slug,
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      )}
                    />
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
          </div>
        ))}
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
