import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sessionHandler from '../api/admin/session.js'
import projectsHandler from '../api/admin/projects.js'
import cloudinarySignatureHandler from '../api/admin/cloudinary-signature.js'
import { hashAdminPassword } from '../server/adminAuth.js'
import { validateProjects } from '../server/projectStore.js'

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const response = () => ({
  statusCode: 200,
  headers: {},
  payload: '',
  setHeader(key, value) { this.headers[key.toLowerCase()] = value },
  end(value = '') { this.payload = value },
})

const request = (method, body = undefined, cookie = '') => ({
  method,
  body,
  headers: {
    host: 'localhost:5173',
    origin: 'http://localhost:5173',
    cookie,
  },
  socket: { remoteAddress: '127.0.0.1' },
})

process.env.ADMIN_PASSWORD_HASH = hashAdminPassword('test-password-123')
process.env.ADMIN_SESSION_SECRET = 'test-session-secret-with-at-least-32-characters'
process.env.ADMIN_STORAGE = 'local'
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-admin-'))
process.env.ADMIN_PROJECTS_FILE = path.join(temporaryDirectory, 'projects.json')
await fs.copyFile('public/data/projects.json', process.env.ADMIN_PROJECTS_FILE)

const loginResponse = response()
await sessionHandler(request('POST', { password: 'test-password-123' }), loginResponse)
assert(loginResponse.statusCode === 200, 'Login failed')
const cookie = String(loginResponse.headers['set-cookie']).split(';')[0]
assert(cookie.includes('portfolio_admin_session='), 'Session cookie missing')

const sessionResponse = response()
await sessionHandler(request('GET', undefined, cookie), sessionResponse)
assert(JSON.parse(sessionResponse.payload).authenticated === true, 'Session validation failed')

const projectsResponse = response()
await projectsHandler(request('GET', undefined, cookie), projectsResponse)
assert(projectsResponse.statusCode === 200, 'Projects endpoint failed')
assert(JSON.parse(projectsResponse.payload).projects.length > 0, 'Projects endpoint returned no projects')

const projectsPayload = JSON.parse(projectsResponse.payload).projects
const saveResponse = response()
await projectsHandler(request('PUT', { projects: projectsPayload }, cookie), saveResponse)
assert(saveResponse.statusCode === 200, 'Projects save endpoint failed')
const savedProjects = JSON.parse(await fs.readFile(process.env.ADMIN_PROJECTS_FILE, 'utf8'))
assert(savedProjects.length === projectsPayload.length, 'Projects save wrote invalid data')

const signatureResponse = response()
await cloudinarySignatureHandler(request('POST', { slug: 'Test Project' }, cookie), signatureResponse)
const signaturePayload = JSON.parse(signatureResponse.payload)
assert(signatureResponse.statusCode === 200, 'Cloudinary signature endpoint failed')
assert(signaturePayload.folder === 'portfolio/projects/test-project', 'Cloudinary folder sanitizing failed')
assert(!JSON.stringify(signaturePayload).includes(process.env.CLOUDINARY_API_SECRET), 'Cloudinary secret leaked')

const currentProjects = JSON.parse(await fs.readFile('public/data/projects.json', 'utf8'))
const validated = validateProjects(currentProjects)
assert(validated.projects.length === currentProjects.length, 'Project validation changed project count')

let invalidRejected = false
try {
  validateProjects([...currentProjects, { ...currentProjects[0], id: 999 }])
} catch {
  invalidRejected = true
}
assert(invalidRejected, 'Duplicate slug validation failed')

await fs.rm(temporaryDirectory, { recursive: true, force: true })

console.log('Admin verification passed: auth, session, protected read/write API, Cloudinary signature, project validation.')
