import {
  assertTrustedOrigin,
  canAttemptLogin,
  clearAdminSessionCookie,
  clearLoginAttempts,
  hasValidAdminSession,
  isAdminConfigured,
  readJsonBody,
  sendJson,
  setAdminSessionCookie,
  verifyAdminPassword,
} from '../../server/adminAuth.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, {
      authenticated: hasValidAdminSession(req),
      configured: isAdminConfigured(),
    })
  }

  if (req.method === 'DELETE') {
    if (!assertTrustedOrigin(req)) return sendJson(res, 403, { error: 'Недоверенный источник запроса.' })
    clearAdminSessionCookie(req, res)
    return sendJson(res, 200, { authenticated: false })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE')
    return sendJson(res, 405, { error: 'Метод не поддерживается.' })
  }

  if (!assertTrustedOrigin(req)) return sendJson(res, 403, { error: 'Недоверенный источник запроса.' })
  if (!isAdminConfigured()) {
    return sendJson(res, 503, { error: 'Админ-панель ещё не настроена.', code: 'ADMIN_NOT_CONFIGURED' })
  }
  if (!canAttemptLogin(req)) {
    return sendJson(res, 429, { error: 'Слишком много попыток. Повторите вход через 15 минут.' })
  }

  try {
    const body = await readJsonBody(req, 20_000)
    if (!verifyAdminPassword(body.password || '')) {
      await new Promise(resolve => setTimeout(resolve, 350))
      return sendJson(res, 401, { error: 'Неверный пароль.' })
    }

    clearLoginAttempts(req)
    setAdminSessionCookie(req, res)
    return sendJson(res, 200, { authenticated: true })
  } catch {
    return sendJson(res, 400, { error: 'Не удалось обработать запрос.' })
  }
}
