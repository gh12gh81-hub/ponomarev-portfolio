export const serviceCategories = [
  'brand-identity',
  'packaging',
  'ui-ux',
  'motion-design',
  'art-direction',
] as const

export type ServiceCategory = (typeof serviceCategories)[number]

export interface ProjectTranslation {
  client: string
  description: string
  challenge: string
  solution: string
}

export type ProjectMediaType = 'image' | 'video'

export interface ProjectMediaItem {
  type: ProjectMediaType
  src: string
  poster?: string
}

export type ProjectGalleryItem = string | ProjectMediaItem

export interface Project {
  id: number
  title: string
  slug: string
  year: string
  category: string
  services?: ServiceCategory[]
  translations?: {
    ru: ProjectTranslation
    en: ProjectTranslation
  }
  description?: string
  layout?: string
  client?: string
  tools?: string
  challenge?: string
  solution?: string
  cover: string
  hero?: string      // <-- Добавили
  banner?: string    // <-- Добавили
  gallery: ProjectGalleryItem[]
}
