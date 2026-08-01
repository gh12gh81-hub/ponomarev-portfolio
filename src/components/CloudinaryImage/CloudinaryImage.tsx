import { memo } from 'react'
import styles from './CloudinaryImage.module.css'

interface Props {
  src: string
  alt: string
  className?: string
  width?: number
  loading?: 'lazy' | 'eager'
  sizes?: string
}

export const getCloudinaryUrl = (src: string, width: number) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_${width}/${src}`
}

export const CloudinaryImage = memo(({
  src,
  alt,
  className,
  width = 1200,
  loading = 'lazy',
  sizes = '100vw',
}: Props) => {
  const candidates = [...new Set([480, 768, 1200, 1600, 2000, width]
    .filter(candidate => candidate <= width)
    .sort((a, b) => a - b))]
  const url = getCloudinaryUrl(src, width)
  const srcSet = candidates
    .map(candidate => `${getCloudinaryUrl(src, candidate)} ${candidate}w`)
    .join(', ')

  return (
    <img
      src={url}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`${styles.image} ${className || ''}`}
      loading={loading}
      decoding="async"
    />
  )
})
