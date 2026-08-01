import crypto from 'node:crypto'
import {
  assertTrustedOrigin,
  readJsonBody,
  requireAdmin,
  sendJson,
} from '../../server/adminAuth.js'

const safeFolderPart = value => String(value || 'new-project')
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 80) || 'new-project'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { error: 'Метод не поддерживается.' })
  }
  if (!assertTrustedOrigin(req)) return sendJson(res, 403, { error: 'Недоверенный источник запроса.' })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return sendJson(res, 503, { error: 'Загрузка Cloudinary ещё не настроена.', code: 'CLOUDINARY_NOT_CONFIGURED' })
  }

  try {
    const body = await readJsonBody(req, 20_000)
    const resourceType = body.resourceType === 'video' ? 'video' : 'image'
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = `portfolio/projects/${safeFolderPart(body.slug)}`
    const parameters = {
      folder,
      timestamp,
      unique_filename: 'true',
      use_filename: 'true',
    }
    const stringToSign = Object.entries(parameters)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    const signature = crypto
      .createHash('sha1')
      .update(`${stringToSign}${apiSecret}`)
      .digest('hex')

    return sendJson(res, 200, {
      apiKey,
      cloudName,
      folder,
      signature,
      timestamp,
      uniqueFilename: true,
      useFilename: true,
      resourceType,
      uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`,
    })
  } catch {
    return sendJson(res, 400, { error: 'Не удалось подготовить загрузку.' })
  }
}
