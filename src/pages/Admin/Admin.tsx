import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { getCloudinaryUrl } from '@/components/CloudinaryImage/CloudinaryImage'
import { Seo } from '@/components/Seo/Seo'
import { getTranslationForLanguage, type Language } from '@/contexts/LanguageContext'
import {
  getAdminProjects,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  saveAdminProjects,
  uploadAdminImage,
  type AdminSession,
} from '@/api/admin'
import {
  serviceCategories,
  type Project,
  type ProjectTranslation,
  type ServiceCategory,
} from '@/types'
import styles from './Admin.module.css'

const serviceLabels: Record<ServiceCategory, string> = {
  'brand-identity': 'Brand Identity',
  packaging: 'Packaging',
  'ui-ux': 'UI / UX',
  'motion-design': 'Motion Design',
  'art-direction': 'Art Direction',
}

const emptyTranslation = (): ProjectTranslation => ({
  client: '',
  description: '',
  challenge: '',
  solution: '',
})

const getLegacyTranslation = (
  project: Project,
  language: Language,
  field: keyof ProjectTranslation,
) => {
  const key = `projectDetails.${project.slug}.${field}`
  const translated = getTranslationForLanguage(language, key)
  if (translated !== key) return translated
  if (language === 'en') return ''
  return String(project[field] || '')
}

const hydrateProject = (project: Project): Project => ({
  ...project,
  services: project.services || [],
  hero: project.hero || project.cover,
  banner: project.banner || '',
  translations: {
    ru: {
      client: project.translations?.ru.client ?? getLegacyTranslation(project, 'ru', 'client'),
      description: project.translations?.ru.description ?? getLegacyTranslation(project, 'ru', 'description'),
      challenge: project.translations?.ru.challenge ?? getLegacyTranslation(project, 'ru', 'challenge'),
      solution: project.translations?.ru.solution ?? getLegacyTranslation(project, 'ru', 'solution'),
    },
    en: {
      client: project.translations?.en.client ?? getLegacyTranslation(project, 'en', 'client'),
      description: project.translations?.en.description ?? getLegacyTranslation(project, 'en', 'description'),
      challenge: project.translations?.en.challenge ?? getLegacyTranslation(project, 'en', 'challenge'),
      solution: project.translations?.en.solution ?? getLegacyTranslation(project, 'en', 'solution'),
    },
  },
})

const createProject = (projects: Project[]): Project => {
  const id = Math.max(0, ...projects.map(project => project.id)) + 1
  return {
    id,
    title: 'Новый проект',
    slug: `new-project-${id}`,
    year: String(new Date().getFullYear()),
    category: 'Brand Identity',
    services: ['brand-identity'],
    translations: { ru: emptyTranslation(), en: emptyTranslation() },
    description: '',
    layout: 'square',
    client: '',
    tools: '',
    challenge: '',
    solution: '',
    cover: '',
    hero: '',
    banner: '',
    gallery: [],
  }
}

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '')

const assetUrl = (value: string) => value.startsWith('http') ? value : getCloudinaryUrl(value, 800)

interface UploadControlProps {
  id: string
  label: string
  multiple?: boolean
  disabled: boolean
  onFiles: (files: File[]) => void
}

function UploadControl({ id, label, multiple = false, disabled, onFiles }: UploadControlProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length > 0) onFiles(files)
  }

  return (
    <label className={`${styles.uploadButton} ${disabled ? styles.uploadButtonDisabled : ''}`} htmlFor={id}>
      {label}
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />
    </label>
  )
}

export default function Admin() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [baseline, setBaseline] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [language, setLanguage] = useState<Language>('ru')
  const [source, setSource] = useState<'local' | 'github' | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null)

  const selectedProject = useMemo(
    () => projects.find(project => project.id === selectedId) || null,
    [projects, selectedId],
  )
  const dirty = useMemo(() => baseline !== '' && JSON.stringify(projects) !== baseline, [baseline, projects])

  useEffect(() => {
    let active = true
    getAdminSession()
      .then(result => { if (active) setSession(result) })
      .catch(() => { if (active) setSession({ authenticated: false, configured: true }) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!session?.authenticated) return
    let active = true
    setLoading(true)
    getAdminProjects()
      .then(result => {
        if (!active) return
        const hydrated = result.projects.map(hydrateProject)
        setProjects(hydrated)
        setBaseline(JSON.stringify(hydrated))
        setSource(result.source)
        setSelectedId(hydrated[0]?.id ?? null)
      })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Не удалось загрузить проекты.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.authenticated])

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [dirty])

  const updateSelected = (updater: (project: Project) => Project) => {
    if (!selectedProject) return
    setProjects(current => current.map(project => project.id === selectedProject.id ? updater(project) : project))
    setNotice('')
    setError('')
  }

  const updateTranslation = (field: keyof ProjectTranslation, value: string) => {
    updateSelected(project => ({
      ...project,
      translations: {
        ru: project.translations?.ru || emptyTranslation(),
        en: project.translations?.en || emptyTranslation(),
        [language]: {
          ...(project.translations?.[language] || emptyTranslation()),
          [field]: value,
        },
      },
    }))
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginAdmin(password)
      setPassword('')
      setSession({ ...result, configured: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (dirty && !window.confirm('Есть несохранённые изменения. Всё равно выйти?')) return
    await logoutAdmin().catch(() => undefined)
    setSession({ authenticated: false, configured: true })
    setProjects([])
    setBaseline('')
  }

  const handleNewProject = () => {
    const project = createProject(projects)
    setProjects(current => [...current, project])
    setSelectedId(project.id)
    setLanguage('ru')
  }

  const handleDeleteProject = () => {
    if (!selectedProject || !window.confirm(`Удалить проект «${selectedProject.title}»?`)) return
    const remaining = projects.filter(project => project.id !== selectedProject.id)
    setProjects(remaining)
    setSelectedId(remaining[0]?.id ?? null)
  }

  const moveProject = (direction: -1 | 1) => {
    if (!selectedProject) return
    const index = projects.findIndex(project => project.id === selectedProject.id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) return
    const reordered = [...projects]
    ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
    setProjects(reordered)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const synchronized = projects.map(project => ({
        ...project,
        description: project.translations?.ru.description || '',
        client: project.translations?.ru.client || '',
        challenge: project.translations?.ru.challenge || '',
        solution: project.translations?.ru.solution || '',
      }))
      const result = await saveAdminProjects(synchronized)
      const hydrated = result.projects.map(hydrateProject)
      setProjects(hydrated)
      setBaseline(JSON.stringify(hydrated))
      setSource(result.source)
      setNotice(result.source === 'github'
        ? 'Сохранено в GitHub. Изменения появятся на сайте после обновления страницы — обычно в течение 30 секунд.'
        : 'Сохранено локально. Изменения уже доступны в dev-версии.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить проекты.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (target: 'cover' | 'hero' | 'gallery', files: File[]) => {
    if (!selectedProject) return
    setUploading(target)
    setError('')
    setNotice('')
    try {
      const uploaded = []
      for (const file of files) uploaded.push(await uploadAdminImage(file, selectedProject.slug))
      const publicIds = uploaded.map(asset => asset.publicId)
      updateSelected(project => target === 'gallery'
        ? { ...project, gallery: [...project.gallery, ...publicIds] }
        : { ...project, [target]: publicIds[0] })
      setNotice(`${files.length === 1 ? 'Изображение загружено' : `Загружено изображений: ${files.length}`}. Нажмите «Сохранить изменения».`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить изображение.')
    } finally {
      setUploading('')
    }
  }

  const moveGalleryImage = (from: number, to: number) => {
    if (!selectedProject || from === to || from < 0 || to < 0 || to >= selectedProject.gallery.length) return
    updateSelected(project => {
      const gallery = [...project.gallery]
      const [image] = gallery.splice(from, 1)
      gallery.splice(to, 0, image)
      return { ...project, gallery }
    })
  }

  if (loading && !session?.authenticated) {
    return <div className={styles.statusScreen}>Проверка доступа…</div>
  }

  if (session && !session.configured) {
    return (
      <main className={styles.authPage}>
        <Seo title="Настройка админ-панели" description="Служебная страница." noIndex />
        <section className={styles.authCard}>
          <span className={styles.brandMark}>NP / ADMIN</span>
          <h1>Админ-панель не настроена</h1>
          <p>Добавьте серверные переменные окружения из файла <code>ADMIN.md</code> и повторно разверните сайт.</p>
        </section>
      </main>
    )
  }

  if (!session?.authenticated) {
    return (
      <main className={styles.authPage}>
        <Seo title="Вход в админ-панель" description="Служебная страница." noIndex />
        <form className={styles.authCard} onSubmit={handleLogin}>
          <span className={styles.brandMark}>NP / ADMIN</span>
          <h1>Управление портфолио</h1>
          <p>Введите пароль администратора.</p>
          <label>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={12}
              required
              autoFocus
            />
          </label>
          {error && <p className={styles.errorMessage} role="alert">{error}</p>}
          <button className={styles.primaryButton} type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className={styles.adminPage}>
      <Seo title="Редактор портфолио" description="Служебная страница." noIndex />
      <header className={styles.topbar}>
        <div>
          <span className={styles.brandMark}>NP / ADMIN</span>
          <span className={styles.sourceBadge}>{source === 'github' ? 'GitHub' : 'Local'}</span>
        </div>
        <div className={styles.topbarActions}>
          <a href="/" target="_blank" rel="noreferrer">Открыть сайт ↗</a>
          <button type="button" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div>
              <span className={styles.eyebrow}>Проекты</span>
              <strong>{projects.length}</strong>
            </div>
            <button type="button" className={styles.addButton} onClick={handleNewProject}>+ Добавить</button>
          </div>
          <div className={styles.projectList}>
            {projects.map((project, index) => (
              <button
                type="button"
                key={project.id}
                className={`${styles.projectListItem} ${project.id === selectedId ? styles.projectListItemActive : ''}`}
                onClick={() => setSelectedId(project.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span><strong>{project.title}</strong><small>{project.slug}</small></span>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.editor}>
          {loading ? (
            <div className={styles.editorEmpty}>Загрузка проектов…</div>
          ) : selectedProject ? (
            <>
              <div className={styles.editorHeader}>
                <div>
                  <span className={styles.eyebrow}>Редактирование / {selectedProject.id}</span>
                  <h1>{selectedProject.title}</h1>
                </div>
                <div className={styles.editorActions}>
                  <a className={styles.previewLink} href={`/projects/${selectedProject.slug}`} target="_blank" rel="noreferrer">Предпросмотр ↗</a>
                  <button type="button" onClick={() => moveProject(-1)} aria-label="Переместить проект выше">↑</button>
                  <button type="button" onClick={() => moveProject(1)} aria-label="Переместить проект ниже">↓</button>
                  <button type="button" className={styles.deleteButton} onClick={handleDeleteProject}>Удалить</button>
                </div>
              </div>

              {(error || notice) && (
                <div className={error ? styles.errorBanner : styles.noticeBanner} role={error ? 'alert' : 'status'}>
                  {error || notice}
                </div>
              )}

              <div className={styles.formSection}>
                <div className={styles.sectionTitle}><span>01</span><h2>Основное</h2></div>
                <div className={styles.formGrid}>
                  <label className={styles.fieldWide}>
                    <span>Название проекта</span>
                    <input value={selectedProject.title} onChange={event => updateSelected(project => ({ ...project, title: event.target.value }))} />
                  </label>
                  <label>
                    <span>Slug</span>
                    <div className={styles.inlineField}>
                      <input value={selectedProject.slug} onChange={event => updateSelected(project => ({ ...project, slug: event.target.value.toLowerCase() }))} />
                      <button type="button" onClick={() => updateSelected(project => ({ ...project, slug: slugify(project.title) || project.slug }))}>Из названия</button>
                    </div>
                  </label>
                  <label>
                    <span>Год</span>
                    <input value={selectedProject.year} onChange={event => updateSelected(project => ({ ...project, year: event.target.value }))} />
                  </label>
                  <label>
                    <span>Категория на карточке</span>
                    <input value={selectedProject.category} onChange={event => updateSelected(project => ({ ...project, category: event.target.value }))} />
                  </label>
                  <label>
                    <span>Инструменты</span>
                    <input value={selectedProject.tools || ''} onChange={event => updateSelected(project => ({ ...project, tools: event.target.value }))} />
                  </label>
                  <label>
                    <span>Макет карточки</span>
                    <select value={selectedProject.layout || 'square'} onChange={event => updateSelected(project => ({ ...project, layout: event.target.value }))}>
                      <option value="square">Квадратный</option>
                      <option value="wide">Широкий</option>
                      <option value="tall">Вертикальный</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.sectionTitle}><span>02</span><h2>Услуги</h2></div>
                <div className={styles.serviceOptions}>
                  {serviceCategories.map(service => {
                    const checked = selectedProject.services?.includes(service) || false
                    return (
                      <label key={service} className={checked ? styles.serviceChecked : ''}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => updateSelected(project => ({
                            ...project,
                            services: checked
                              ? project.services?.filter(item => item !== service)
                              : [...(project.services || []), service],
                          }))}
                        />
                        <span>{serviceLabels[service]}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.sectionTitle}><span>03</span><h2>Тексты</h2></div>
                <div className={styles.languageTabs} role="tablist" aria-label="Язык текста">
                  <button type="button" role="tab" aria-selected={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button>
                  <button type="button" role="tab" aria-selected={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
                </div>
                <div className={styles.textFields}>
                  <label>
                    <span>Клиент</span>
                    <input value={selectedProject.translations?.[language].client || ''} onChange={event => updateTranslation('client', event.target.value)} />
                  </label>
                  <label>
                    <span>Краткое описание</span>
                    <textarea rows={3} value={selectedProject.translations?.[language].description || ''} onChange={event => updateTranslation('description', event.target.value)} />
                  </label>
                  <label>
                    <span>Задача</span>
                    <textarea rows={6} value={selectedProject.translations?.[language].challenge || ''} onChange={event => updateTranslation('challenge', event.target.value)} />
                  </label>
                  <label>
                    <span>Решение</span>
                    <textarea rows={6} value={selectedProject.translations?.[language].solution || ''} onChange={event => updateTranslation('solution', event.target.value)} />
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.sectionTitle}><span>04</span><h2>Обложка и hero</h2></div>
                <div className={styles.mediaGrid}>
                  {(['cover', 'hero'] as const).map(target => {
                    const value = selectedProject[target] || ''
                    return (
                      <article className={styles.mediaCard} key={target}>
                        <div className={styles.mediaPreview}>
                          {value ? <img src={assetUrl(value)} alt="" /> : <span>Нет изображения</span>}
                        </div>
                        <div className={styles.mediaCardHeader}>
                          <strong>{target === 'cover' ? 'Обложка' : 'Hero'}</strong>
                          <UploadControl
                            id={`${target}-upload`}
                            label={uploading === target ? 'Загрузка…' : 'Загрузить'}
                            disabled={Boolean(uploading)}
                            onFiles={files => handleUpload(target, files)}
                          />
                        </div>
                        <label>
                          <span>Cloudinary public ID</span>
                          <input value={value} onChange={event => updateSelected(project => ({ ...project, [target]: event.target.value }))} />
                        </label>
                      </article>
                    )
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  <span>05</span>
                  <h2>Галерея</h2>
                  <UploadControl
                    id="gallery-upload"
                    label={uploading === 'gallery' ? 'Загрузка…' : '+ Добавить изображения'}
                    multiple
                    disabled={Boolean(uploading)}
                    onFiles={files => handleUpload('gallery', files)}
                  />
                </div>
                <p className={styles.helperText}>Перетаскивайте карточки или используйте стрелки. Загруженные файлы появятся на сайте после сохранения проекта.</p>
                <div className={styles.galleryGrid}>
                  {selectedProject.gallery.map((image, index) => (
                    <article
                      className={styles.galleryCard}
                      key={`${image}-${index}`}
                      draggable
                      onDragStart={() => setDraggedGalleryIndex(index)}
                      onDragOver={event => event.preventDefault()}
                      onDrop={() => {
                        if (draggedGalleryIndex !== null) moveGalleryImage(draggedGalleryIndex, index)
                        setDraggedGalleryIndex(null)
                      }}
                    >
                      <div className={styles.galleryImage}><img src={assetUrl(image)} alt="" /></div>
                      <div className={styles.galleryMeta}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <button type="button" onClick={() => moveGalleryImage(index, index - 1)} aria-label="Переместить изображение влево">←</button>
                          <button type="button" onClick={() => moveGalleryImage(index, index + 1)} aria-label="Переместить изображение вправо">→</button>
                          <button type="button" className={styles.removeImage} onClick={() => updateSelected(project => ({ ...project, gallery: project.gallery.filter((_, itemIndex) => itemIndex !== index) }))}>Удалить</button>
                        </div>
                      </div>
                      <input aria-label={`Cloudinary public ID изображения ${index + 1}`} value={image} onChange={event => updateSelected(project => ({ ...project, gallery: project.gallery.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} />
                    </article>
                  ))}
                  {selectedProject.gallery.length === 0 && <div className={styles.galleryEmpty}>Добавьте первое изображение галереи.</div>}
                </div>
              </div>

              <footer className={styles.saveBar}>
                <span>{dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}</span>
                <button type="button" className={styles.primaryButton} onClick={handleSave} disabled={saving || Boolean(uploading) || !dirty}>
                  {saving ? 'Сохранение…' : 'Сохранить изменения'}
                </button>
              </footer>
            </>
          ) : (
            <div className={styles.editorEmpty}>Создайте первый проект.</div>
          )}
        </section>
      </div>
    </main>
  )
}
