import type { Project } from '@/types'

interface ApiErrorPayload {
  error?: string
  code?: string
}

export interface AdminSession {
  authenticated: boolean
  configured: boolean
}

export interface AdminProjectsResponse {
  projects: Project[]
  source: 'local' | 'github'
}

export interface SaveProjectsResponse extends AdminProjectsResponse {
  deploymentPending: boolean
  commitUrl?: string | null
}

interface CloudinarySignature {
  apiKey: string
  cloudName: string
  folder: string
  signature: string
  timestamp: number
  uniqueFilename: boolean
  useFilename: boolean
  uploadUrl: string
}

interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
}

interface CloudinaryErrorResponse {
  error?: { message?: string }
}

export interface UploadedAsset {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({})) as T & ApiErrorPayload

  if (!response.ok) {
    const error = new Error(payload.error || 'Не удалось выполнить запрос.')
    Object.assign(error, { status: response.status, code: payload.code })
    throw error
  }

  return payload
}

export const getAdminSession = () => request<AdminSession>('/api/admin/session')

export const loginAdmin = (password: string) => request<AdminSession>('/api/admin/session', {
  method: 'POST',
  body: JSON.stringify({ password }),
})

export const logoutAdmin = () => request<AdminSession>('/api/admin/session', { method: 'DELETE' })

export const getAdminProjects = () => request<AdminProjectsResponse>('/api/admin/projects')

export const saveAdminProjects = (projects: Project[]) => request<SaveProjectsResponse>('/api/admin/projects', {
  method: 'PUT',
  body: JSON.stringify({ projects }),
})

export async function uploadAdminImage(file: File, slug: string): Promise<UploadedAsset> {
  if (!file.type.startsWith('image/')) throw new Error(`«${file.name}» не является изображением.`)
  if (file.size > 25 * 1024 * 1024) throw new Error(`«${file.name}» больше 25 МБ.`)

  const signed = await request<CloudinarySignature>('/api/admin/cloudinary-signature', {
    method: 'POST',
    body: JSON.stringify({ slug }),
  })
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', signed.apiKey)
  form.append('timestamp', String(signed.timestamp))
  form.append('signature', signed.signature)
  form.append('folder', signed.folder)
  form.append('unique_filename', String(signed.uniqueFilename))
  form.append('use_filename', String(signed.useFilename))

  const response = await fetch(signed.uploadUrl, { method: 'POST', body: form })
  const payload = await response.json().catch(() => ({})) as CloudinaryUploadResponse & CloudinaryErrorResponse
  if (!response.ok) throw new Error(payload.error?.message || `Не удалось загрузить «${file.name}».`)

  return {
    publicId: payload.public_id,
    secureUrl: payload.secure_url,
    width: payload.width,
    height: payload.height,
    format: payload.format,
  }
}
