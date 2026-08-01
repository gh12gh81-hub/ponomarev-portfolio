import type { ProjectGalleryItem, ProjectMediaItem, ProjectMediaType } from '@/types'

export const normalizeProjectMedia = (item: ProjectGalleryItem): ProjectMediaItem => (
  typeof item === 'string'
    ? { type: 'image', src: item }
    : {
        type: item.type === 'video' ? 'video' : 'image',
        src: item.src,
        ...(item.poster ? { poster: item.poster } : {}),
      }
)

export const createProjectMedia = (
  type: ProjectMediaType,
  src: string,
  poster = '',
): ProjectGalleryItem => {
  if (type === 'image' && !poster) return src
  return { type, src, ...(poster ? { poster } : {}) }
}
