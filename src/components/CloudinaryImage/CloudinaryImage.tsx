import { memo } from 'react'
import styles from './CloudinaryImage.module.css'

interface Props {
  src: string
  alt: string
  className?: string
  width?: number
}

export const CloudinaryImage = memo(({ src, alt, className, width = 1200 }: Props) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME // Добавь в .env
  
  // Формируем URL с оптимизацией (авто-формат WebP/AVIF, авто-качество)
 const url =
  `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_${width}/${src}`;
  return <img src={url} alt={alt} className={`${styles.image} ${className || ''}`} loading="lazy" />
})
