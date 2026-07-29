import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchProjects } from '@/features/projectsSlice'
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage'
import { AppDispatch, RootState } from '@/store'
import styles from './Home.module.css'

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: projects, status } = useSelector((state: RootState) => state.projects)
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProjects())
  }, [status, dispatch])

  const loadMore = () => setVisibleCount(prev => prev + 4)

  return (
    <div className={styles.home}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Nikolai<br/>Graphic Designer</h1>
          <div className={styles.servicesTags}>
            <span>Branding</span>
            <span className={styles.dot}></span>
            <span>Packaging</span>
            <span className={styles.dot}></span>
            <span>UI</span>
            <span className={styles.dot}></span>
            <span>Motion</span>
          </div>
          <div className={styles.scrollHint}>↓ Scroll to explore</div>
        </div>
      </section>

      {/* Галерея */}
      <section className={styles.gallery}>
        {Array.isArray(projects) && projects.filter(p => p.cover).slice(0, visibleCount).map((project, idx) => {
          let layoutClass = styles.gridItem
          if (project.layout === 'wide') layoutClass += ` ${styles.wide}`
          if (project.layout === 'tall') layoutClass += ` ${styles.tall}`

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className={layoutClass}
            >
              <Link to={`/projects/${project.slug}`} className="hoverable">
                <CloudinaryImage src={project.cover} alt={project.title} width={1600} />
                <div className={styles.overlay}>
                  <span className={styles.title}>{project.title}</span>
                  <span className={styles.category}>{project.category}</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </section>

      {/* Load More */}
      {projects.filter(p => p.cover).length > visibleCount && (
        <div className={styles.loadMoreWrapper}>
          <button onClick={loadMore} className={styles.loadMoreBtn}>
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
