
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  className?: string
  placeholder?: string
}

export function OptimizedVideo({ 
  src, 
  className, 
  placeholder,
  ...props 
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    if (!videoRef.current) return
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Only load the video when it's in the viewport
          if (videoRef.current) {
            videoRef.current.src = src
            videoRef.current.load()
            observer.unobserve(entry.target)
          }
        }
      })
    }, { threshold: 0.1 })
    
    observer.observe(videoRef.current)
    
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [src])
  
  const handleLoad = () => {
    setIsLoaded(true)
  }
  
  return (
    <div className="relative">
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <video 
        ref={videoRef}
        onLoadedData={handleLoad}
        className={cn(className)}
        {...props}
      />
    </div>
  )
}
