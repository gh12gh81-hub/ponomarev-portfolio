import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import { getCloudinaryUrl } from '@/components/CloudinaryImage/CloudinaryImage'

interface Props {
  src: string
  poster?: string
  className?: string
  width?: number
  autoPlay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  ariaLabel?: string
  onClick?: (event: MouseEvent<HTMLVideoElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLVideoElement>) => void
  onMouseMove?: (event: MouseEvent<HTMLVideoElement>) => void
}

const isRemoteUrl = (value: string) => /^https?:\/\//i.test(value)

export const getCloudinaryVideoUrl = (src: string) => {
  if (isRemoteUrl(src)) return src
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${src}`
}

export const getCloudinaryVideoPosterUrl = (src: string, width = 1600) => {
  if (isRemoteUrl(src)) return undefined
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0,q_auto,f_jpg,w_${width}/${src}.jpg`
}

export const CloudinaryVideo = memo(({
  src,
  poster,
  className,
  width = 1600,
  autoPlay = false,
  controls = false,
  loop = false,
  muted = false,
  preload = 'metadata',
  ariaLabel,
  onClick,
  onMouseEnter,
  onMouseMove,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(query.matches)
    updatePreference()
    query.addEventListener('change', updatePreference)
    return () => query.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reduceMotion) videoRef.current?.pause()
  }, [reduceMotion])

  const shouldAutoPlay = autoPlay && !reduceMotion
  const resolvedPoster = poster
    ? (isRemoteUrl(poster) ? poster : getCloudinaryUrl(poster, width))
    : getCloudinaryVideoPosterUrl(src, width)

  return (
    <video
      ref={videoRef}
      src={getCloudinaryVideoUrl(src)}
      poster={resolvedPoster}
      className={className}
      autoPlay={shouldAutoPlay}
      controls={controls}
      loop={loop}
      muted={muted || shouldAutoPlay}
      playsInline
      preload={preload}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
    />
  )
})
