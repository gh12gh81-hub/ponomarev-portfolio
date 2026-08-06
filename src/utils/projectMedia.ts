import type { ProjectGalleryItem, ProjectMediaItem, ProjectMediaLayout, ProjectMediaType } from '@/types'

export const normalizeProjectMedia = (item: ProjectGalleryItem): ProjectMediaItem => (
  typeof item === 'string'
    ? { type: 'image', src: item }
    : {
        type: item.type === 'video' ? 'video' : 'image',
        src: item.src,
        ...(item.poster ? { poster: item.poster } : {}),
        ...(item.layout === 'half' ? { layout: 'half' as const } : {}),
      }
)

export const createProjectMedia = (
  type: ProjectMediaType,
  src: string,
  poster = '',
  layout: ProjectMediaLayout = 'wide',
): ProjectGalleryItem => {
  if (type === 'image' && !poster && layout === 'wide') return src
  return {
    type,
    src,
    ...(poster ? { poster } : {}),
    ...(layout === 'half' ? { layout } : {}),
  }
}
