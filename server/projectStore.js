import fs from 'node:fs/promises'
import path from 'node:path'

const PROJECTS_PATH = 'public/data/projects.json'
const SERVICE_CATEGORIES = new Set([
  'brand-identity',
  'packaging',
  'ui-ux',
  'motion-design',
  'art-direction',
])
const LAYOUTS = new Set(['wide', 'square', 'tall'])

const text = (value, maxLength, field, required = false) => {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new Error(`Поле «${field}» обязательно.`)
  if (result.length > maxLength) throw new Error(`Поле «${field}» слишком длинное.`)
  return result
}

const translation = (value, legacy, language) => {
  const source = value && typeof value === 'object' ? value : {}
  return {
    client: text(source.client ?? (language === 'ru' ? legacy.client : ''), 300, `client ${language}`),
    description: text(source.description ?? (language === 'ru' ? legacy.description : ''), 3000, `description ${language}`),
    challenge: text(source.challenge ?? (language === 'ru' ? legacy.challenge : ''), 6000, `challenge ${language}`),
    solution: text(source.solution ?? (language === 'ru' ? legacy.solution : ''), 6000, `solution ${language}`),
  }
}

const galleryItem = (value, index) => {
  if (typeof value === 'string') return text(value, 500, `gallery ${index + 1}`, true)
  if (!value || typeof value !== 'object') {
    throw new Error(`Медиафайл ${index + 1} в галерее имеет неверный формат.`)
  }

  const type = value.type === 'video' ? 'video' : value.type === 'image' ? 'image' : ''
  if (!type) throw new Error(`У медиафайла ${index + 1} указан неверный тип.`)
  const src = text(value.src, 500, `gallery ${index + 1} src`, true)
  const poster = text(value.poster, 500, `gallery ${index + 1} poster`)
  return { type, src, ...(poster ? { poster } : {}) }
}

function normalizeProject(value, index) {
  if (!value || typeof value !== 'object') throw new Error(`Проект ${index + 1} имеет неверный формат.`)

  const id = Number(value.id)
  if (!Number.isInteger(id) || id <= 0) throw new Error(`У проекта ${index + 1} неверный id.`)

  const slug = text(value.slug, 100, 'slug', true).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Slug «${slug}» может содержать только латинские буквы, цифры и дефисы.`)
  }

  const services = Array.isArray(value.services)
    ? [...new Set(value.services.filter(item => SERVICE_CATEGORIES.has(item)))]
    : []
  if (services.length === 0) throw new Error(`У проекта «${slug}» должна быть выбрана хотя бы одна услуга.`)

  const legacy = {
    client: text(value.client, 300, 'client'),
    description: text(value.description, 3000, 'description'),
    challenge: text(value.challenge, 6000, 'challenge'),
    solution: text(value.solution, 6000, 'solution'),
  }
  const translations = {
    ru: translation(value.translations?.ru, legacy, 'ru'),
    en: translation(value.translations?.en, legacy, 'en'),
  }
  const layout = LAYOUTS.has(value.layout) ? value.layout : 'square'
  const cover = text(value.cover, 500, 'cover', true)
  const gallery = Array.isArray(value.gallery)
    ? value.gallery.map(galleryItem)
    : []
  if (gallery.length > 100) throw new Error(`В проекте «${slug}» больше 100 медиафайлов.`)

  return {
    id,
    title: text(value.title, 200, 'title', true),
    slug,
    year: text(value.year, 20, 'year', true),
    category: text(value.category, 200, 'category', true),
    services,
    translations,
    description: translations.ru.description,
    layout,
    client: translations.ru.client,
    tools: text(value.tools, 500, 'tools'),
    challenge: translations.ru.challenge,
    solution: translations.ru.solution,
    cover,
    hero: text(value.hero, 500, 'hero') || cover,
    banner: text(value.banner, 500, 'banner'),
    gallery,
  }
}

export function validateProjects(value) {
  if (!Array.isArray(value)) throw new Error('Ожидался массив проектов.')
  if (value.length > 100) throw new Error('Нельзя сохранить больше 100 проектов.')

  const projects = value.map(normalizeProject)
  const ids = new Set()
  const slugs = new Set()
  for (const project of projects) {
    if (ids.has(project.id)) throw new Error(`Повторяется id ${project.id}.`)
    if (slugs.has(project.slug)) throw new Error(`Повторяется slug «${project.slug}».`)
    ids.add(project.id)
    slugs.add(project.slug)
  }

  const serialized = `${JSON.stringify(projects, null, 2)}\n`
  if (Buffer.byteLength(serialized) > 5_000_000) throw new Error('Файл проектов превышает допустимый размер.')
  return { projects, serialized }
}

function githubConfig() {
  const repository = process.env.GITHUB_REPOSITORY || (
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : ''
  )
  const [owner, repo] = repository.split('/')
  return {
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || 'main',
    token: process.env.GITHUB_TOKEN || '',
  }
}

function useLocalStorage() {
  const { token } = githubConfig()
  return process.env.ADMIN_STORAGE === 'local' || (process.env.VERCEL !== '1' && !token)
}

function localProjectsPath() {
  return process.env.ADMIN_PROJECTS_FILE || path.join(process.cwd(), PROJECTS_PATH)
}

async function githubRequest(url, options = {}) {
  const { token } = githubConfig()
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ponomarev-portfolio-admin',
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.message || 'GitHub API request failed.')
    error.status = response.status
    throw error
  }
  return payload
}

async function readFromGitHub() {
  const { owner, repo, branch, token } = githubConfig()
  if (!owner || !repo || !token) throw new Error('GitHub-хранилище админ-панели не настроено.')
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${PROJECTS_PATH}?ref=${encodeURIComponent(branch)}`
  const payload = await githubRequest(url)
  const content = Buffer.from(String(payload.content || '').replace(/\s/g, ''), 'base64').toString('utf8')
  return { projects: JSON.parse(content), sha: payload.sha, source: 'github' }
}

export async function readProjectsForAdmin() {
  if (useLocalStorage()) {
    const projects = JSON.parse(await fs.readFile(localProjectsPath(), 'utf8'))
    return { projects, source: 'local' }
  }
  return readFromGitHub()
}

export async function saveProjectsForAdmin(value) {
  const { projects, serialized } = validateProjects(value)

  if (useLocalStorage()) {
    await fs.writeFile(localProjectsPath(), serialized, 'utf8')
    return { projects, source: 'local', deploymentPending: false }
  }

  const { owner, repo, branch } = githubConfig()
  const current = await readFromGitHub()
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${PROJECTS_PATH}`
  const payload = await githubRequest(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `content: update portfolio projects (${new Date().toISOString()})`,
      content: Buffer.from(serialized, 'utf8').toString('base64'),
      sha: current.sha,
      branch,
    }),
  })

  return {
    projects,
    source: 'github',
    deploymentPending: false,
    commitUrl: payload.commit?.html_url || null,
  }
}
