import crypto from 'node:crypto'

const COOKIE_NAME = 'portfolio_admin_session'
const SESSION_DURATION_SECONDS = 8 * 60 * 60
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 8

const loginAttempts = globalThis.__portfolioAdminLoginAttempts ?? new Map()
globalThis.__portfolioAdminLoginAttempts = loginAttempts

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.end(JSON.stringify(payload))
}

export async function readJsonBody(req, maxBytes = 1_000_000) {
  if (req.body && typeof req.body === 'object') {
    if (Buffer.byteLength(JSON.stringify(req.body)) > maxBytes) throw new Error('REQUEST_TOO_LARGE')
    return req.body
  }
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body) > maxBytes) throw new Error('REQUEST_TOO_LARGE')
    return JSON.parse(req.body)
  }

  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (Buffer.byteLength(body) > maxBytes) throw new Error('REQUEST_TOO_LARGE')
  }

  return body ? JSON.parse(body) : {}
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .reduce((cookies, part) => {
      const index = part.indexOf('=')
      if (index === -1) return cookies
      const key = part.slice(0, index).trim()
      const value = part.slice(index + 1).trim()
      if (key) cookies[key] = decodeURIComponent(value)
      return cookies
    }, {})
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || ''
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH &&
    getSessionSecret().length >= 32,
  )
}

export function assertTrustedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true

  try {
    const originHost = new URL(origin).host
    const requestHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    return originHost === requestHost
  } catch {
    return false
  }
}

export function hashAdminPassword(password, salt = crypto.randomBytes(16).toString('base64url')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('base64url')
  return `scrypt:${salt}:${hash}`
}

export function verifyAdminPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || ''
  const [algorithm, salt, expectedValue] = stored.split(':')
  if (algorithm !== 'scrypt' || !salt || !expectedValue) return false

  const actual = crypto.scryptSync(String(password), salt, 64)
  const expected = Buffer.from(expectedValue, 'base64url')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function sign(value) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('base64url')
}

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    nonce: crypto.randomBytes(12).toString('base64url'),
  })).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function hasValidAdminSession(req) {
  if (!isAdminConfigured()) return false
  const token = parseCookies(req)[COOKIE_NAME]
  if (!token) return false

  const [payload, providedSignature] = token.split('.')
  if (!payload || !providedSignature) return false

  const expectedSignature = sign(payload)
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return false

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return Number(session.exp) > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function requireAdmin(req, res) {
  if (!isAdminConfigured()) {
    sendJson(res, 503, { error: 'Админ-панель ещё не настроена.', code: 'ADMIN_NOT_CONFIGURED' })
    return false
  }

  if (!hasValidAdminSession(req)) {
    sendJson(res, 401, { error: 'Требуется вход в админ-панель.', code: 'UNAUTHORIZED' })
    return false
  }

  return true
}

export function setAdminSessionCookie(req, res) {
  const secure = process.env.VERCEL === '1' || req.headers['x-forwarded-proto'] === 'https'
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(createSessionToken())}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${SESSION_DURATION_SECONDS}`,
  ]
  if (secure) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearAdminSessionCookie(req, res) {
  const secure = process.env.VERCEL === '1' || req.headers['x-forwarded-proto'] === 'https'
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ]
  if (secure) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function clientKey(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
}

export function canAttemptLogin(req) {
  const key = clientKey(req)
  const now = Date.now()
  const entry = loginAttempts.get(key)

  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_LOGIN_ATTEMPTS) return false
  entry.count += 1
  return true
}

export function clearLoginAttempts(req) {
  loginAttempts.delete(clientKey(req))
}
