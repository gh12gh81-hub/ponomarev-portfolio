import {
  assertTrustedOrigin,
  readJsonBody,
  requireAdmin,
  sendJson,
} from '../../server/adminAuth.js'
import {
  readProjectsForAdmin,
  saveProjectsForAdmin,
} from '../../server/projectStore.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const result = await readProjectsForAdmin()
      return sendJson(res, 200, result)
    } catch (error) {
      return sendJson(res, error.status || 500, { error: error.message || 'Не удалось загрузить проекты.' })
    }
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT')
    return sendJson(res, 405, { error: 'Метод не поддерживается.' })
  }

  if (!assertTrustedOrigin(req)) return sendJson(res, 403, { error: 'Недоверенный источник запроса.' })

  try {
    const body = await readJsonBody(req, 6_000_000)
    const result = await saveProjectsForAdmin(body.projects)
    return sendJson(res, 200, result)
  } catch (error) {
    if (error.message === 'REQUEST_TOO_LARGE') {
      return sendJson(res, 413, { error: 'Данные проектов слишком большие.' })
    }
    return sendJson(res, error.status || 400, { error: error.message || 'Не удалось сохранить проекты.' })
  }
}
