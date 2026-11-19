import { ImageOff } from 'lucide-react'
import { useState } from 'react'

/** Product image with a graceful fallback when the URL is missing or broken. */
export function ProductImage({ src, alt, className = '' }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`} role="img" aria-label={alt}>
        <ImageOff className="size-1/4 max-h-12 max-w-12" aria-hidden />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
