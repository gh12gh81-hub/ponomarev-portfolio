export interface Project {
  id: number
  title: string
  slug: string
  year: string
  category: string
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
