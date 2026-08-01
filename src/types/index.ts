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
  gallery: string[]
}
